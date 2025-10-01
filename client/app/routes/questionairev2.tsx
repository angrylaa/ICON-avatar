import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { Navbar } from "../components/custom/Navbar";
import { useRequireAuth } from "../lib/useRequireAuth";
import type { Route } from "./+types/home";
// @ts-ignore

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Questionaire() {
  useRequireAuth();
  const boxRefs = useRef<HTMLImageElement[]>([]);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const badges = [
    "badge1.svg",
    "badge2.svg",
    "badge3.svg",
    "badge4.svg",
    "badge5.svg",
  ];

  const addToRefs = (el: HTMLImageElement) => {
    if (el && !boxRefs.current.includes(el)) {
      boxRefs.current.push(el);
    }
  };

  useEffect(() => {
    // Animate badges
    gsap.to(boxRefs.current, {
      duration: 1,
      rotation: 360,
      opacity: 1,
      delay: 0.5,
      stagger: 0.1,
      ease: "sine.out",
    });

    gsap.to(textRef.current, {
      duration: 1.5,
      opacity: 1,
      delay: 0.2,
      stagger: 0.1,
      ease: "sine.out",
    });

    gsap.to(buttonRef.current, {
      duration: 1.5,
      opacity: 1,
      delay: 0.2,
      stagger: 0.1,
      ease: "sine.out",
    });
  }, []);

  const getStarted = (index: number) => {
    gsap.to(boxRefs.current, {
      duration: 0.5,
      opacity: 0,
      y: -100,
      stagger: {
        from: index,
        amount: 1,
      },
      ease: "back.in",
      overwrite: "auto",
    });
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col bg-[#FFF6DE] h-screen justify-center items-center gap-4">
        <div className="flex gap-2">
          {badges.map((src, index) => (
            <img
              onClick={() => {
                getStarted(index);
              }}
              key={index}
              ref={addToRefs}
              src={src}
              alt={`badge ${index + 1}`}
              className="w-42 block dark:hidden opacity-0"
            />
          ))}
        </div>
        <div
          className="opacity-0 flex flex-col gap-4 justify-center items-center"
          ref={textRef}
        >
          <div className="text-3xl text-[#4f2e1b]">
            Click on a badge to get started!
          </div>
        </div>
      </div>
    </div>
  );
}
