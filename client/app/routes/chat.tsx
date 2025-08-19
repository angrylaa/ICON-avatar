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
  const form = useForm<{ chat: string }>({ defaultValues: { chat: "" } });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (data: { chat: string }) => {
    const cleanInput = useSanitize(data.chat);
    if (!cleanInput.trim() || loading) return;
    const userMsg: ChatMessage = { sender: "user", text: cleanInput };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    const aiRes = await sendChatMessage(cleanInput);
    setMessages((prev) => [...prev, { sender: "ai", text: aiRes.reply }]);
    setLoading(false);
    form.reset();
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="relative flex-1 flex flex-col items-center justify-center bg-[#FFF6DE]">
        <img
          src="/topright.png"
          alt="top right corner"
          className="absolute top-0 right-0 w-1/3 max-w-[320px] h-auto z-0"
          style={{ pointerEvents: "none" }}
        />
        <img
          src="/bottomleft.png"
          alt="bottom left corner"
          className="absolute bottom-0 left-0 w-1/3 max-w-[320px] h-auto z-0"
          style={{ pointerEvents: "none" }}
        />
        <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
          <div className="flex flex-col items-center mb-8">
            <div className="flex flex-col items-center">
              <img
                src="/frame1.png"
                alt="Tyler avatar"
                className="w-48 h-48 rounded-full mb-2 object-cover"
              />
              <div className="text-xl font-bold text-[#B4933F] mb-12">
                Tyler
              </div>
            </div>
            <div className="flex gap-4 mb-6">
              <div className="hover:cursor-pointer animate__animated animate__pulse bg-[#CBB06A] rounded-md p-4 w-56 text-[#fff] text-sm flex flex-col items-center">
                <span>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  <BotMessageSquare className="mt-4"></BotMessageSquare>
                </span>
              </div>
              <div className="hover:cursor-pointer animate__animated animate__pulse bg-[#CBB06A] rounded-md p-4 w-56 text-[#fff] text-sm flex flex-col items-center">
                <span>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  <BotMessageSquare className="mt-4"></BotMessageSquare>
                </span>
              </div>
              <div className="hover:cursor-pointer animate__animated animate__pulse bg-[#CBB06A] rounded-md p-4 w-56 text-[#fff] text-sm flex flex-col items-center">
                <span>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  <BotMessageSquare className="mt-4"></BotMessageSquare>
                </span>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col gap-4 mb-4 max-h-132 p-4 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-md px-4 py-2 text-sm ${msg.sender === "user" ? "border border-[#947627] max-w-[80%] bg-white text-[#B4933F]" : "border border-[#947627] bg-[#CBB06A] text-white max-w-[80%]"}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSend)}
              className="w-full flex mt-2 justify-center items-center"
            >
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    type="text"
                    className="bg-white border border-[#947627] rounded-sm p-4 w-full focus:outline-none"
                    placeholder="Let's chat..."
                    {...form.register("chat")}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              <Button
                type="submit"
                className="ml-2 px-6 py-2 bg-[#B4933F] text-white rounded-md hover:bg-[#947627]"
                disabled={loading || !form.watch("chat").trim()}
              >
                Send
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
