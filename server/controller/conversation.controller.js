import { db } from "../db/db.js";
import { GoogleGenAI } from "@google/genai";
// All chat history persistence is handled on the frontend now

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

    // No server-side persistence for history; frontend maintains and sends it each request

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

    // After receiving AI response, append to history locally only
    const updatedHistory = [...(history || []), { role: "model", parts: [{ text: response.text }] }];

    // console.debug("AI response", response);

    // Generate two recommended prompts based on the user's selected mode (advice vs conversation)
    const mode = inferConversationMode(style, categories);
    const topic = extractTopicFromText(message || response.text || "");
    const suggestedPrompts = generateSuggestedPrompts(mode, topic, message, response.text);

    res.json({ reply: response.text, history: updatedHistory, suggestedPrompts });
  } catch (err) {
    next(err);
  }
}

// Determine whether the user wanted advice or a general conversation
function inferConversationMode(style, categories) {
  const haystack = [String(style || "").toLowerCase(), ...(Array.isArray(categories) ? categories : []).map((c) => String(c).toLowerCase())].join(" ");
  if (haystack.includes("advice") || haystack.includes("resource")) return "advice";
  if (haystack.includes("conversation") || haystack.includes("chat") || haystack.includes("talk")) return "conversation";
  return "conversation";
}

// Very light topic extraction from a text input
function extractTopicFromText(text) {
  if (!text || typeof text !== "string") return "this topic";
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = normalized.split(/\s+/).filter(Boolean);
  const stop = new Set([
    "i","im","i'm","am","is","are","was","were","be","been","being","the","a","an","and","or","but","if","then","so","to","for","with","on","in","of","at","by","from","about","as","it","this","that","these","those","you","your","yours","my","mine","me","we","our","ours","they","their","them","he","she","his","her","hers","do","does","did","doing","can","could","should","would","will","won't","dont","don't","didnt","didn't","cant","can't","just","like"
  ]);
  const keywords = words.filter((w) => w.length > 2 && !stop.has(w));
  if (keywords.length === 0) return "this topic";
  const top = keywords.slice(0, 3).join(" ");
  return top.trim() || "this topic";
}

function generateSuggestedPrompts(mode, topic, lastUserText, lastAiText) {
  const safeTopic = topic || "this topic";
  if (mode === "advice") {
    return [
      `What are the most important first steps to make progress on ${safeTopic}?`,
      `Do you have 2–3 resources, examples, or templates that can help with ${safeTopic}?`,
    ];
  }
  // conversation mode
  return [
    `That's interesting about ${safeTopic}. Can you tell me more?`,
    `How did you get started with ${safeTopic}, and what has helped you the most?`,
  ];
}