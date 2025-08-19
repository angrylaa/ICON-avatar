import { db } from "../db/db.js";

export async function getKnowledgeForConversation(req, res, next) {
  try {
    const { name, style, message } = req.body;
    let schema;
    if (name === "tyler") {
      schema = (await import("../db/schema/tylerknowledge.js")).tylerKnowledge;
    } else if (name === "daniel") {
      schema = (await import("../db/schema/danielknowledge.js"))
        .danielKnowledge;
    } else if (name === "jenny") {
      schema = (await import("../db/schema/jennyknowledge.js")).jennyKnowledge;
    } else {
      return res.status(400).json({ error: "Invalid name" });
    }

    let allKnowledge = await db.select().from(schema);
    if (req.body.categories && Array.isArray(req.body.categories)) {
      allKnowledge = allKnowledge.filter((entry) => {
        try {
          const tags =
            typeof entry.tags === "string"
              ? JSON.parse(entry.tags)
              : entry.tags;
          const entryCategories = tags?.categories || [];
          return req.body.categories.some((cat) =>
            entryCategories.includes(cat)
          );
        } catch {
          return false;
        }
      });
    }
    res.json({ knowledge: allKnowledge });
  } catch (err) {
    next(err);
  }
}
