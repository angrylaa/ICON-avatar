import { db } from "../db/db.js";
import { GoogleGenAI } from "@google/genai";
import { userConversations } from "../db/schema/users.js";
import { and, desc, eq } from "drizzle-orm";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Utility function for fetching knowledge
async function getKnowledgeForConversation(name, categories, queryText) {
  let schema;
  if (name === "tyler") {
    schema = (await import("../db/schema/tylerknowledge.js")).tylerKnowledge;
  } else if (name === "daniel") {
    schema = (await import("../db/schema/danielknowledge.js")).danielKnowledge;
  } else if (name === "jenny") {
    schema = (await import("../db/schema/jennyknowledge.js")).jennyKnowledge;
  } else {
    throw new Error("Invalid name");
  }

  let allKnowledge = await db.select().from(schema);
  // Normalize and filter by categories if provided
  const normalized = allKnowledge.map((entry) => {
    let parsedTags = entry.tags;
    try {
      parsedTags = typeof entry.tags === "string" ? JSON.parse(entry.tags) : entry.tags;
    } catch {}
    const categoryList = Array.isArray(parsedTags)
      ? parsedTags
      : Array.isArray(parsedTags?.categories)
        ? parsedTags.categories
        : [];
    return { ...entry, _categories: categoryList };
  });

  let filtered = normalized;
  if (categories && Array.isArray(categories) && categories.length > 0) {
    filtered = normalized.filter((entry) =>
      categories.some((cat) => entry._categories.includes(cat))
    );
  }

  // Simple relevance scoring against current user message
  if (queryText && typeof queryText === "string" && queryText.trim()) {
    const q = queryText.toLowerCase();
    filtered = filtered
      .map((k) => {
        const text = `${k.title}\n${k.body}`.toLowerCase();
        const score = (q && text.includes(q) ? 1 : 0) +
          (k._categories || []).reduce((acc, c) => acc + (q.includes(String(c).toLowerCase()) ? 0.5 : 0), 0);
        return { ...k, _score: score };
      })
      .sort((a, b) => (b._score || 0) - (a._score || 0));
  }

  return filtered;
}

const fetchContext = (name, style) => {
  const safeStyle = style || "a helpful conversation";
  if (name === "tyler") {
    return `You are Tyler, a graduate student exploring his early career. You are talking to a user seeking ${safeStyle}. Keep responses concise and friendly.`;
  }
  if (name === "jenny") {
    return `You are Jenny, a mid-career professional growing her career. You are talking to a user seeking ${safeStyle}. Keep responses pragmatic and supportive.`;
  }
  if (name === "daniel") {
    return `You are Daniel, a senior professional planning for retirement. You are talking to a user seeking ${safeStyle}. Keep responses thoughtful and strategic.`;
  }
  throw new Error("Invalid name");
};

function buildKnowledgePrimer(knowledge, categories) {
  if (!knowledge || knowledge.length === 0) return "";
  const limited = knowledge.slice(0, 10); // keep primer short
  const lines = limited.map((k, idx) => {
    const tags = typeof k.tags === "string" ? k.tags : JSON.stringify(k.tags);
    return `- (${idx + 1}) ${k.title}: ${String(k.body).slice(0, 500)}\n  tags: ${tags}`;
  });
  const cats = Array.isArray(categories) && categories.length > 0 ? categories.join(", ") : "general";
  return `You have access to an internal knowledge base filtered for categories: ${cats}. Here are summaries of some relevant knowledge items. Prefer citing specific items when relevant, but do not fabricate citations.\n${lines.join("\n")}`;
}

export async function messageAI(req, res, next) {
  try {
    const { name, categories, style, message, history, newConversation } = req.body;

    // console.debug("Incoming message payload", req.body);

    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Fetch knowledge and context
    const knowledge = await getKnowledgeForConversation(String(name).toLowerCase(), categories, message);
    const context = fetchContext(String(name).toLowerCase(), style);
    const knowledgePrimer = buildKnowledgePrimer(knowledge, categories);

    // Persist/replace user conversation
    const serializedHistory = JSON.stringify(history || []);
    if (newConversation) {
      // Replace by deleting previous conversations for user
      await db.delete(userConversations).where(eq(userConversations.userId, userId));
      await db.insert(userConversations).values({
        userId,
        history: serializedHistory,
        categories: Array.isArray(categories) ? categories.join(",") : null,
        style: style || null,
      });
    } else {
      // Update latest conversation
      const latest = await db
        .select()
        .from(userConversations)
        .where(eq(userConversations.userId, userId))
        .orderBy(desc(userConversations.startedAt))
        .limit(1);
      if (latest && latest.length > 0) {
        await db
          .update(userConversations)
          .set({
            history: serializedHistory,
            updatedAt: new Date(),
            categories: Array.isArray(categories) ? categories.join(",") : latest[0].categories,
            style: style || latest[0].style,
          })
          .where(eq(userConversations.id, latest[0].id));
      } else {
        await db.insert(userConversations).values({
          userId,
          history: serializedHistory,
          categories: Array.isArray(categories) ? categories.join(",") : null,
          style: style || null,
        });
      }
    }

    const chatInstance = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: [context, knowledgePrimer].filter(Boolean).join("\n\n"),
      },
    });

    // console.debug("Chat bot created.");

    // Send message to chat
    const response = await chatInstance.sendMessage({ message });

    // After receiving AI response, append to history and persist
    const updatedHistory = [...(history || []), { role: "model", parts: [{ text: response.text }] }];
    const updatedSerialized = JSON.stringify(updatedHistory);
    const latest = await db
      .select()
      .from(userConversations)
      .where(eq(userConversations.userId, userId))
      .orderBy(desc(userConversations.startedAt))
      .limit(1);
    if (latest && latest.length > 0) {
      await db
        .update(userConversations)
        .set({ history: updatedSerialized, updatedAt: new Date() })
        .where(eq(userConversations.id, latest[0].id));
    }

    // console.debug("AI response", response);

    res.json({ reply: response.text, history: updatedHistory });
  } catch (err) {
    next(err);
  }
}
