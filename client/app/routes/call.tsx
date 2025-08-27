import type { Route } from "./+types/home";
import { useRequireAuth } from "~/lib/useRequireAuth";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "../components/custom/Navbar";
import { Button } from "../components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import type { ChatMessage } from "../../services/aiChat";
import { sendChatMessage } from "../../services/aiChat";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Call" },
    { name: "description", content: "Call with your AI Avatar" },
  ];
}

// Feature detection wrapper for Web Speech API with loose typing
function getSpeechRecognition(): any {
  if (typeof window === "undefined") return undefined as any;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition
  );
}

export default function Call() {
  useRequireAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [profile, setProfile] = useState({
    name: "tyler",
    style: "career advice",
    categories: ["General Knowledge"],
    avatarImg: "/frame1.png",
  });

  const recognitionRef = useRef<any>(null);

  // Initialize avatar selection and style from questionaire
  useEffect(() => {
    const selections = JSON.parse(
      localStorage.getItem("questionaireSelections") || "[]"
    );
    if (Array.isArray(selections) && selections.length === 3) {
      const selectedName = (selections[0] || "tyler").toLowerCase();
      const style = selections[1] || "career advice";
      const categories = [style];
      const avatarImg =
        selectedName === "tyler"
          ? "/frame1.png"
          : selectedName === "jenny"
            ? "/frame3.png"
            : "/frame2.png";
      setProfile({ name: selectedName, style, categories, avatarImg });
    }
  }, []);

  // Cleanup any ongoing speech on unmount
  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null as any;
          recognitionRef.current.onerror = null as any;
          recognitionRef.current.onend = null as any;
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) return;

    const rec: any = new (SpeechRec as any)();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (event: any) => {
      let combined = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        combined += res[0].transcript;
      }
      setTranscript(combined);
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setIsListening(true);
    } catch {}
  };

  const stopListeningAndSend = async () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);

    const text = transcript.trim();
    if (!text) return;

    const userMsg: ChatMessage = { role: "user", parts: [{ text }] };
    setMessages((prev) => [...prev, userMsg]);
    setTranscript("");

    setLoading(true);
    try {
      const aiRes = await sendChatMessage(
        text,
        [...messages, userMsg],
        profile.name,
        profile.categories,
        profile.style,
        messages.length === 0
      );

      const replyText = aiRes.reply;
      setMessages((prev) => [...prev, { role: "model", parts: [{ text: replyText }] }]);
      speak(replyText);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "Sorry, something went wrong." }] },
      ]);
    }
    setLoading(false);
  };

  const speak = (text: string) => {
    try {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      const utter = new (window as any).SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.pitch = 1;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  const stopSpeaking = () => {
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } catch {}
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF6DE]">
      <Navbar />

      <div className="flex-1 grid grid-cols-1 place-items-center p-6">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center">
            <img
              src={profile.avatarImg}
              alt={profile.name + " avatar"}
              className="rounded-full object-cover w-28 h-28 mb-4"
            />
            <div className="text-xl font-bold text-[#B4933F] mb-1">
              {profile.name.charAt(0).toUpperCase() + profile.name.slice(1)}
            </div>
            <div className="text-[#947627] text-sm mb-4">Focus: {profile.style}</div>

            <div className="w-full max-h-60 overflow-y-auto border border-[#e8ddbd] rounded-xl p-4 mb-6 bg-[#FFFBEE]">
              {messages.map((m, i) => (
                <div key={i} className="mb-3">
                  <div className="text-xs font-semibold text-[#947627] mb-1">
                    {m.role === "user" ? "You" : profile.name}
                  </div>
                  <div className={`text-sm ${m.role === "user" ? "text-[#B4933F]" : "text-[#3f3a2a]"}`}>
                    {m.parts.map((p, j) => (
                      <span key={j}>{p.text}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {!isListening ? (
                <Button
                  className="bg-[#CBB06A] text-white"
                  onClick={startListening}
                  disabled={loading}
                >
                  <Mic className="mr-2 h-4 w-4" /> Start speaking
                </Button>
              ) : (
                <Button
                  className="bg-[#B4933F] text-white"
                  onClick={stopListeningAndSend}
                >
                  <MicOff className="mr-2 h-4 w-4" /> Stop and send
                </Button>
              )}

              {!isSpeaking ? (
                <Button className="bg-[#CBB06A] text-white" onClick={() => speak("Hi! How can I help you today?")}> 
                  <Volume2 className="mr-2 h-4 w-4" /> Test voice
                </Button>
              ) : (
                <Button className="bg-[#B4933F] text-white" onClick={stopSpeaking}>
                  <VolumeX className="mr-2 h-4 w-4" /> Stop voice
                </Button>
              )}

              {loading && (
                <div className="flex items-center text-[#947627]">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>

            {transcript && (
              <div className="mt-6 w-full text-sm text-[#947627]">
                <div className="font-semibold mb-1">Heard:</div>
                <div className="border border-[#e8ddbd] rounded-lg p-3 bg-[#FFFBEE]">
                  {transcript}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
