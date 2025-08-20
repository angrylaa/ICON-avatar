import { db } from "../db/db.js";
import { GoogleGenAI } from "@google/genai";
import { userConversations } from "../db/schema/users.js";
import { eq } from "drizzle-orm";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
let chatInstance = null;

// Utility function for fetching knowledge
async function getKnowledgeForConversation(name, categories) {
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
  if (categories && Array.isArray(categories)) {
    allKnowledge = allKnowledge.filter((entry) => {
      try {
        const tags =
          typeof entry.tags === "string" ? JSON.parse(entry.tags) : entry.tags;
        const entryCategories = tags?.categories || [];
        return categories.some((cat) => entryCategories.includes(cat));
      } catch {
        return false;
      }
    });
  }
  return allKnowledge;
}

const fetchContext = (name, style) => {
  let context;
  if (name === "tyler") {
    context = `You are a graduate student named Tyler exploring his early career. You are having a conversation with an individual looking for ${style}.`;
  } else if (name === "daniel") {
    context = `You are a working professional named Jenny in the middle of her career. You are having a conversation with an individual looking for ${style}.`;
  } else if (name === "jenny") {
    context = `You are a senior professional named Daniel planning for retirement. You are having a conversation with an individual looking for ${style}.`;
  } else {
    return res.status(400).json({ error: "Invalid name" });
  }

  return context;
};

export async function messageAI(req, res, next) {
  try {
    const { name, categories, style, message, history, newConversation } =
      req.body;

    console.log(req.body, "REQUEST HERE");

    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Fetch knowledge and context
    const knowledge = await getKnowledgeForConversation(name, categories);
    const context = fetchContext(name, style);

    // If starting a new conversation, delete previous for this user
    if (newConversation) {
      await db
        .delete(userConversations)
        .where(eq(userConversations.userId, userId));

      console.log("New Conversation created.");
    }

    const chatInstance = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: context,
      },
    });

    console.log("CHat bot created.");

    // Send message to chat
    const response = await chatInstance.sendMessage({
      message: message,
    });

    console.log(response);

    res.json({ reply: response.text, history: chatInstance.history });
  } catch (err) {
    next(err);
  }
}
