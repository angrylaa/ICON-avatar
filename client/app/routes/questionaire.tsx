import { Button } from "~/components/ui/button";
import type { Route } from "./+types/home";
import { MoveRight } from "lucide-react";
import { MoveLeft } from "lucide-react";
import { useState } from "react";
import { useRequireAuth } from "../lib/useRequireAuth";
import { Navbar } from "../components/custom/Navbar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Questionaire() {
  useRequireAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState("next");
  const [selectedOptions, setSelectedOptions] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [sending, setSending] = useState(false);
  const stepTitles = ["Persona", "Focus", "Connect"];
  const stepHeadings = [
    "Before we chat, which avatar do you resonate the most with?",
    "Great! What's your primary focus for this conversation?",
    "Finally, how do you want to connect?",
  ];

  const handleSelect = (stepIdx: number, value: string) => {
    setSelectedOptions((prev) => {
      const updated = [...prev];
      updated[stepIdx] = value;
      return updated;
    });
  };

  const progressStep = (step: number, progression: string) => {
    if (progression === "next") {
      setDirection("next");
      if (step < 2) {
        setStep(step + 1);
      } else if (step === 2) {
        // Finalize selections when all 3 are chosen
        if (selectedOptions.every((opt) => opt)) {
          try {
            setSending(true);
            // Persist for chat route to pick up
            localStorage.setItem(
              "questionaireSelections",
              JSON.stringify(selectedOptions)
            );
            // Navigate based on last selection
            if (selectedOptions[2] === "text") {
              window.location.href = "/chat";
            } else if (selectedOptions[2] === "call") {
              window.location.href = "/call";
            }
          } finally {
            setSending(false);
          }
        }
      }
    } else if (progression === "back") {
      setDirection("back");
      if (step > 0) {
        setStep(step - 1);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FFF6DE]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-center">
          <div className="flex w-full gap-8">
            <aside className="hidden md:flex w-64 flex-col gap-2">
              <div className="text-sm font-semibold text-[#B4933F] mb-1">Steps</div>
              {stepTitles.map((label, idx) => (
                <button
                  key={label}
                  className={`text-left px-4 py-3 rounded-lg border ${
                    step === idx
                      ? "bg-[#B4933F] text-white border-[#B4933F]"
                      : "bg-white/60 text-[#B4933F] border-[#B4933F]/30"
                  }`}
                  onClick={() => {
                    if (idx <= step) setStep(idx);
                  }}
                >
                  <div className="text-sm font-medium">{label}</div>
                </button>
              ))}
            </aside>
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow p-8">
                <div className="animate__animated animate__fadeIn text-center text-2xl md:text-3xl font-bold text-[#B4933F] mb-8">
                  {stepHeadings[step]}
                </div>

                {step === 0 && (
                  <div
                    className={`animate__animated ${
                      direction === "next"
                        ? "animate__slideInRight"
                        : "animate__slideInLeft"
                    } mx-auto w-4xl grid grid-cols-1 md:grid-cols-3 gap-18 h-32 mb-2`}
                  >
                    <div
                      className={`hover:cursor-pointer bg-[url('/frame1.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4 ${selectedOptions[0] === "Tyler" ? "border-4 border-[#8f5024]" : ""}`}
                      onClick={() => handleSelect(0, "Tyler")}
                    >
                      <div className="text-md text-center text-white font-bold">
                        Tyler: a graduate student exploring his early career!
                      </div>
                    </div>
                    <div
                      className={`hover:cursor-pointer bg-[url('/frame1.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4 ${selectedOptions[0] === "Jenny" ? "border-4 border-[#8f5024]" : ""}`}
                      onClick={() => handleSelect(0, "Jenny")}
                    >
                      <div className="text-md text-center text-white font-bold">
                        Jenny: a mid-career working professional growing her career!
                      </div>
                    </div>
                    <div
                      className={`hover:cursor-pointer bg-[url('/frame1.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4 ${selectedOptions[0] === "Daniel" ? "border-4 border-[#8f5024]" : ""}`}
                      onClick={() => handleSelect(0, "Daniel")}
                    >
                      <div className="text-md text-center text-white font-bold">
                        Daniel: a senior professional planning for retirement!
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div
                    className={`animate__animated ${
                      direction === "next"
                        ? "animate__slideInRight"
                        : "animate__slideInLeft"
                    } mx-auto w-xl grid grid-cols-1 md:grid-cols-2 gap-18 h-32 mb-2`}
                  >
                    <div
                      className={`hover:cursor-pointer bg-[url('/frame4.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4 ${selectedOptions[1] === "advice" ? "border-4 border-[#8f5024]" : ""}`}
                      onClick={() => handleSelect(1, "advice")}
                    >
                      <div className="text-md text-center text-white font-bold">
                        I'm looking for advice & resources!
                      </div>
                    </div>
                    <div
                      className={`hover:cursor-pointer bg-[url('/frame5.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4 ${selectedOptions[1] === "conversation" ? "border-4 border-[#8f5024]" : ""}`}
                      onClick={() => handleSelect(1, "conversation")}
                    >
                      <div className="text-md text-center text-white font-bold">
                        I'm looking for a general conversation!
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div
                    className={`animate__animated ${
                      direction === "next"
                        ? "animate__slideInRight"
                        : "animate__slideInLeft"
                    } mx-auto w-xl grid grid-cols-1 md:grid-cols-2 gap-18 h-32 mb-2`}
                  >
                    <div
                      className={`hover:cursor-pointer bg-[url('/frame2.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4 ${selectedOptions[2] === "text" ? "border-4 border-[#8f5024]" : ""}`}
                      onClick={() => handleSelect(2, "text")}
                    >
                      <div className="text-md text-center text-white font-bold">
                        Let's text!
                      </div>
                    </div>
                    <div
                      className={`hover:cursor-pointer bg-[url('/frame1.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4 ${selectedOptions[2] === "call" ? "border-4 border-[#8f5024]" : ""}`}
                      onClick={() => handleSelect(2, "call")}
                    >
                      <div className="text-md text-center text-white font-bold">
                        Let's call!
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    className="w-36 bg-[#B4933F] hover:bg-[#947627] hover:cursor-pointer"
                    type="submit"
                    disabled={step === 0}
                    onClick={() => {
                      progressStep(step, "back");
                    }}
                  >
                    <MoveLeft></MoveLeft>
                    Back
                  </Button>
                  <Button
                    className="w-36 bg-[#B4933F] hover:bg-[#947627] hover:cursor-pointer"
                    type="submit"
                    onClick={() => {
                      progressStep(step, "next");
                    }}
                    disabled={!selectedOptions[step] || sending}
                  >
                    Next
                    <MoveRight></MoveRight>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
