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

// Canonical list of supported user-facing categories
const SUPPORTED_CATEGORIES = [
  "Resources",
  "General Knowledge",
  "Advice",
  "Career",
  "School",
];

// Lightweight heuristic classifier to infer categories from a user message
function inferCategoriesFromMessageText(text) {
  const inferred = new Set();
  const t = String(text || "").toLowerCase();

  // Resources intent
  const resourcesHints = [
    /\b(resource|resources|link|links|where can i find|examples?|templates?|guide|reading list|reference)\b/,
    /\bshare (some )?(good )?(material|articles|docs|documentation)\b/,
  ];
  if (resourcesHints.some((re) => re.test(t))) inferred.add("Resources");

  // Advice intent
  const adviceHints = [
    /\b(advice|advise|tips?|tricks?|suggestions?|recommend|recommendations?)\b/,
    /\bshould i|how should i|what should i\b/,
    /\bhow can i (improve|get|land|become|prepare)\b/,
  ];
  if (adviceHints.some((re) => re.test(t))) inferred.add("Advice");

  // Career domain
  const careerHints = [
    /\b(career|job|jobs|work|resume|cv|cover letter|interview|networking|internship|promotion|manager|offer|salary|negotiation)\b/,
  ];
  if (careerHints.some((re) => re.test(t))) inferred.add("Career");

  // School/education domain
  const schoolHints = [
    /\b(school|class|course|college|university|uni|degree|major|assignment|homework|exam|midterm|finals|professor|teacher|syllabus)\b/,
  ];
  if (schoolHints.some((re) => re.test(t))) inferred.add("School");

  // If we have no specific domain, assume general knowledge
  if (inferred.size === 0) inferred.add("General Knowledge");

  // Keep only supported labels and return deterministic order
  return Array.from(inferred).filter((c) => SUPPORTED_CATEGORIES.includes(c));
}

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

    // Derive categories from the user's message and merge with any provided
    const autoCategories = inferCategoriesFromMessageText(message);
    const provided = Array.isArray(categories) ? categories : [];
    const finalCategories = Array.from(new Set([...(autoCategories || []), ...provided]));

    // Fetch knowledge and context
    const knowledge = await getKnowledgeForConversation(String(name).toLowerCase(), finalCategories, message);
    const context = fetchContext(String(name).toLowerCase(), style);
    const knowledgePrimer = buildKnowledgePrimer(knowledge, finalCategories);

    // No server-side persistence for history; frontend maintains and sends it each request

    const chatInstance = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: [
          context,
          moderationInstruction(),
          characterLimitInstruction(),
          knowledgePrimer,
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    });

    // console.debug("Chat bot created.");

    // Send message to chat
    const response = await chatInstance.sendMessage({ message });
    const MAX_REPLY_CHARS = Number(process.env.AI_MAX_CHARS || 500);
    const rawReply = response.text;
    const safeReply = sanitizeModelText(rawReply, MAX_REPLY_CHARS);

    // After receiving AI response, append to history locally only
    const updatedHistory = [...(history || []), { role: "model", parts: [{ text: safeReply }] }];

    // console.debug("AI response", response);

    // Generate two recommended prompts using AI based on conversation context
    const mode = inferConversationMode(style, finalCategories);
    const topic = extractTopicFromText(message || response.text || "");
    let suggestedPrompts = [];
    try {
      suggestedPrompts = await generateSuggestedPromptsAI({
        name,
        style,
        categories: finalCategories,
        history: updatedHistory,
        lastUserText: message,
        lastAiText: safeReply,
        mode,
      });
    } catch {}
    if (!Array.isArray(suggestedPrompts) || suggestedPrompts.length === 0) {
      suggestedPrompts = generateSuggestedPrompts(mode, topic, message, safeReply);
    }
    // Final sanitize and enforce short length for suggestions
    suggestedPrompts = (suggestedPrompts || [])
      .map((p) => sanitizeModelText(String(p || ""), 120))
      .filter((p) => p && p.length > 0)
      .slice(0, 2);

    res.json({
      ok: true,
      version: "1.0",
      reply: safeReply,
      suggestedPrompts,
      history: updatedHistory,
      meta: {
        model: "gemini-2.5-flash",
        maxChars: MAX_REPLY_CHARS,
        mode,
        categories: finalCategories,
      },
    });
  } catch (err) {
    next(err);
  }
}

function moderationInstruction() {
  return [
    "Strict safety policy:",
    "- Do not produce profanity, slurs, hate speech, harassment, graphic/sexual content, or erotica.",
    "- If asked to engage in sexual or explicit content or to swear, refuse politely and redirect to appropriate topics.",
    "- Keep a professional, respectful tone at all times.",
  ].join("\n");
}

function characterLimitInstruction() {
  const maxChars = Number(process.env.AI_MAX_CHARS || 500);
  return `Keep your entire response under ${maxChars} characters.`;
}

function sanitizeModelText(text, maxChars) {
  const t = String(text || "").trim();
  const clean = enforceModeration(t);
  const limited = clean.length > maxChars ? clean.slice(0, maxChars) : clean;
  return limited;
}

function enforceModeration(text) {
  const t = String(text || "").toLowerCase();
  // Simple but strict blocklists for profanity and sexual content
  const profanity = [
    /\b(?:f+u+c*k+|s+h*i+t+|b+i+t+c+h+|a+s+s+h*o*l*e+|d+i*c+k+|c+u+n+t+)\b/,
    /\b(?:mf\b|moth\w*f\w*r|bullshit|piss(?:ed)?|damn)\b/,
  ];
  const sexual = [
    /\b(?:sex|sexual|erotic|porn|pornography|nude|naked|horny|blowjob|handjob|anal|cum|orgasm|vagina|penis|boobs|tits|threesome|kink|fetish)\b/,
  ];
  const blocked = [...profanity, ...sexual].some((re) => re.test(t));
  if (blocked) {
    return "I can't engage in profanity or sexual content. Let's keep things respectful and appropriate.";
  }
  return text;
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

async function generateSuggestedPromptsAI({ name, style, categories, history, lastUserText, lastAiText, mode }) {
  const safeMode = mode === "advice" ? "advice" : "conversation";
  const instruction = [
    `You are helping propose the next two user prompts for a chat assistant. The user selected mode: ${safeMode}.`,
    `Generate two thoughtful, diverse, short follow-up prompts (<120 characters each) that would move the conversation forward.`,
    `Tailor them to the user's context and the assistant's latest reply. Avoid repeating the user's last question verbatim.`,
    `Do not ask the same thing twice. If in advice mode, one prompt should be action-oriented and one should ask for resources/examples.`,
    `Output ONLY a valid JSON array of exactly two strings, no preamble or extra text.`,
  ].join("\n");

  const suggChat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: Array.isArray(history) ? history : [],
    config: {
      systemInstruction: instruction,
    },
  });

  const suggestionPrompt = [
    `Last user message: ${String(lastUserText || "").slice(0, 1200)}`,
    `Last assistant reply: ${String(lastAiText || "").slice(0, 1200)}`,
    `Style: ${String(style || "").slice(0, 200)}; Categories: ${(Array.isArray(categories) ? categories.join(", ") : "").slice(0, 200)}`,
    `Return JSON now.`,
  ].join("\n");

  const gen = await suggChat.sendMessage({ message: suggestionPrompt });
  const raw = String(gen.text || gen?.response?.text || "").trim();
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cleaned = parsed
        .map((s) => String(s || "").trim())
        .filter((s) => s.length > 0)
        .slice(0, 2);
      if (cleaned.length === 2) return cleaned;
    }
  } catch {}
  // fallback: try to split lines
  const lines = raw
    .replace(/^```[\s\S]*?\n|```$/g, "")
    .split(/\n|\r/)
    .map((l) => l.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 2);
  if (lines.length === 2) return lines;
  return [];
}