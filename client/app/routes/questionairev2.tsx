import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "../components/custom/Navbar";
import { useRequireAuth } from "../lib/useRequireAuth";
import type { Route } from "./+types/home";

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
  const boxRefs = useRef<HTMLImageElement[]>([]);

  const addToRefs = (el: HTMLImageElement) => {
    if (el && !boxRefs.current.includes(el)) {
      boxRefs.current.push(el);
    }
  };

  useEffect(() => {
    // Example GSAP animation on mount
    gsap.to(boxRefs.current, {
      duration: 1,
      rotation: 360,
      opacity: 1,
      delay: 0.5,
      stagger: 0.1,
      ease: "sine.out",
    });
  }, []);

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

  const badges = [
    "badge1.svg",
    "badge2.svg",
    "badge3.svg",
    "badge4.svg",
    "badge5.svg",
  ];

  return (
    <div className="h-screen">
      <Navbar />
      <div className="flex bg-[#FFF6DE] h-100% justify-center items-center gap-4">
        {badges.map((src, index) => (
          <img
            key={index}
            ref={addToRefs}
            src={src}
            alt={`badge ${index + 1}`}
            className="w-42 block dark:hidden opacity-0"
          />
        ))}
      </div>
    </div>
  );
}
