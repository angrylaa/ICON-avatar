import { useState, useRef, useEffect } from "react";

export type ChatMessage = {
  sender: "user" | "ai";
  text: string;
};

export async function sendChatMessage(
  message: string
): Promise<{ reply: string }> {
  // Simulate AI response (replace with backend call if needed)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ reply: `AI says: ${message}` });
    }, 800);
  });
}
