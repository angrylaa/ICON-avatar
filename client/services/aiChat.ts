import { getAuthToken } from "~/lib/utils";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  name: string,
  categories: string[],
  style: string,
  newConversation?: boolean
): Promise<{ reply: string; history: ChatMessage[] }> {
  const authToken = getAuthToken();

  console.log(message, history, name, categories, style, newConversation);

  const res = await fetch(`${API_URL}/conversation/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({
      message,
      history,
      name,
      categories,
      style,
      newConversation,
    }),
  });
  if (!res.ok) throw new Error("Failed to get AI response");
  return res.json();
}
