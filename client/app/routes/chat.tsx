import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../../services/aiChat";
import type { ChatMessage } from "../../services/aiChat";
import { Navbar } from "../components/custom/Navbar";
import { BotMessageSquare } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormItem,
  FormControl,
  FormMessage,
} from "../components/ui/form";
import { useSanitize } from "../lib/useSanitize";
import { useForm } from "react-hook-form";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const form = useForm<{ chat: string }>({ defaultValues: { chat: "" } });

  // State for dynamic profile
  const [profile, setProfile] = useState({
    name: "tyler",
    style: "career advice",
    categories: ["General Knowledge"],
    avatarImg: "/frame1.png",
  });

  // Track if this is a new conversation
  const [conversationStarted, setConversationStarted] = useState(false);

  // Read selections from questionaire (localStorage/sessionStorage)
  useEffect(() => {
    inputRef.current?.focus();
    // Get selections from localStorage (set by questionaire)
    const selections = JSON.parse(
      localStorage.getItem("questionaireSelections") || "[]"
    );
    if (Array.isArray(selections) && selections.length === 3) {
      // selections: [avatar, style, path]
      let name = (selections[0] || "tyler").toLowerCase();
      let style = selections[1] || "career advice";
      let categories = [style];
      let avatarImg =
        name === "tyler"
          ? "/frame1.png"
          : name === "jenny"
            ? "/frame3.png"
            : "/frame2.png";
      setProfile({ name, style, categories, avatarImg });
      setConversationStarted(false);
      setMessages([]);
      // Only auto-send if the third selection is not 'text' or 'call'
      const firstMsg = selections[2];
      if (firstMsg && firstMsg !== "text" && firstMsg !== "call") {
        handleSendWithProfile({ chat: firstMsg }, name, style, categories);
      }
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Main send handler for form
  const handleSend = async (data: { chat: string }) => {
    await handleSendWithProfile(
      data,
      profile.name,
      profile.style,
      profile.categories
    );
  };

  // Internal handler for auto-send and backend context
  const handleSendWithProfile = async (
    data: { chat: string },
    forcedName?: string,
    forcedStyle?: string,
    forcedCategories?: string[]
  ) => {
    const cleanInput = useSanitize(data.chat);
    if (!cleanInput.trim() || loading) return;
    const userMsg: ChatMessage = {
      role: "user",
      parts: [{ text: cleanInput }],
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const aiRes = await sendChatMessage(
        cleanInput,
        [...messages, userMsg],
        forcedName || profile.name,
        forcedCategories || profile.categories,
        forcedStyle || profile.style,
        !conversationStarted
      );
      setConversationStarted(true);

      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: aiRes.reply }] },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "Sorry, something went wrong." }] },
      ]);
    }
    setLoading(false);
    form.reset();
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF6DE]">
      <Navbar />

      <div className="flex gap-4 items-center justify-center flex-1">
        <div className="border-2 border-black w-1/3 h-1/2 max-w-[700px] flex items-center justify-center">
          <img
            src={profile.avatarImg}
            alt={profile.name + " avatar"}
            className="rounded-full object-cover w-32 h-32"
          />
        </div>
        <div className="h-1/2 min-h-fit max-h-[800px] flex flex-col min-w-[500px] w-1/2 max-w-[700px] gap-8">
          <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center">
            <div className="flex items-center gap-6 mb-4">
              <div>
                <div className="text-2xl font-bold text-[#B4933F] mb-2">
                  {profile.name.charAt(0).toUpperCase() + profile.name.slice(1)}
                </div>
                <div className="text-[#B4933F] text-sm font-medium">
                  {profile.name === "tyler"
                    ? "Your chat buddy Tyler, a graduate student looking for internships and exploring his early career!"
                    : profile.name === "jenny"
                      ? "Your chat buddy Jenny, a mid-career professional growing her career!"
                      : "Your chat buddy Daniel, a senior professional planning for retirement!"}
                </div>
                <div className="mt-2 text-xs text-[#947627] font-semibold">
                  Focus: {profile.style}
                </div>
                <div className="mt-1 text-xs text-[#947627] font-semibold">
                  Categories: {profile.categories.join(", ")}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md flex flex-col justify-between min-h-[340px] p-6">
            <div
              ref={chatContainerRef}
              className="max-h-100 flex flex-col gap-4 mb-4 overflow-y-auto p-4 custom-scrollbar"
              style={{ maxHeight: 220 }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`text-sm rounded-md px-4 py-3 text-base font-medium ${msg.role === "user" ? "border border-[#947627] max-w-[80%] bg-white text-[#B4933F]" : "border border-[#947627] bg-[#CBB06A] text-white max-w-[80%]"}`}
                  >
                    {msg.parts.map((part, i) => (
                      <span key={i}>{part.text}</span>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="border border-[#947627] bg-[#CBB06A] text-white max-w-[80%] text-sm rounded-md px-4 py-3 text-base font-medium flex items-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Thinking...
                  </div>
                </div>
              )}
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSend)}
                className="flex items-center gap-2 mt-2"
              >
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="text"
                      className="bg-[#F7F3E3] border-none rounded-full px-5 py-3 w-full focus:outline-none text-[#B4933F] placeholder-[#B4933F]"
                      placeholder="Let's chat..."
                      {...form.register("chat")}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <Button
                  type="submit"
                  className="px-8 py-3 bg-[#CBB06A] text-white rounded-full font-semibold text-base hover:bg-[#B4933F]"
                  disabled={loading || !form.watch("chat").trim()}
                >
                  Send
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Add custom scrollbar styles */
// In the same file or in app.css, add:
/*
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  background: #F7F3E3;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #CBB06A;
  border-radius: 8px;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #CBB06A #F7F3E3;
}
*/
