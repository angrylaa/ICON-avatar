import { Button } from "~/components/ui/button";
import type { Route } from "./+types/home";
import { MoveRight } from "lucide-react";
import { MoveLeft } from "lucide-react";
import { useState } from "react";
import { useRequireAuth } from "~/lib/useRequireAuth";
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

  const progressStep = (step: number, progression: string) => {
    if (progression === "next") {
      setDirection("next");
      if (step === 0) {
        setStep(1);
      } else if (step === 1) {
        setStep(2);
      } else {
        setStep(3);
      }
    } else if (progression === "back") {
      setDirection("back");
      if (step === 2) {
        setStep(1);
      } else if (step === 1) {
        setStep(0);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-screen bg-[#FFF6DE] justify-center overflow-hidden">
        {step === 0 && (
          <>
            <div className="animate__animated animate__fadeIn mx-auto w-md text-3xl font-bold text-[#B4933F] mb-18">
              Before we chat, which avatar do you resonate the most with?
            </div>
            <div
              className={`animate__animated ${
                direction === "next"
                  ? "animate__slideInRight"
                  : "animate__slideInLeft"
              } mx-auto w-4xl grid grid-cols-3 gap-18 h-32 mb-10`}
            >
              <div className="hover:cursor-pointer bg-[url('/frame1.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4">
                <div className="text-md text-center text-white font-bold">
                  Tyler: a graduate student exploring his early career!
                </div>
              </div>
              <div className="hover:cursor-pointer bg-[url('/frame1.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4">
                <div className="text-md text-center text-white font-bold">
                  Jenny: a mid-career working professional growing her career!
                </div>
              </div>
              <div className="hover:cursor-pointer bg-[url('/frame1.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4">
                <div className="text-md text-center text-white font-bold">
                  Daniel: a senior professional planning for retirement!
                </div>
              </div>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div className="animate__animated animate__fadeIn mx-auto w-md text-3xl font-bold text-[#B4933F] mb-18">
              Great! What's your primary focus for this conversation?
            </div>
            <div
              className={`animate__animated ${
                direction === "next"
                  ? "animate__slideInRight"
                  : "animate__slideInLeft"
              } mx-auto w-xl grid grid-cols-2 gap-18 h-32 mb-10`}
            >
              <div className="hover:cursor-pointer bg-[url('/frame4.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4">
                <div className="text-md text-center text-white font-bold">
                  I'm looking for advice & resources!
                </div>
              </div>
              <div className="hover:cursor-pointer bg-[url('/frame5.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4">
                <div className="text-md text-center text-white font-bold">
                  I'm looking for a general conversation!
                </div>
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="animate__animated animate__fadeIn mx-auto w-md text-3xl font-bold text-[#B4933F] mb-18">
              Finally, how do you want to connect?
            </div>
            <div
              className={`animate__animated ${
                direction === "next"
                  ? "animate__slideInRight"
                  : "animate__slideInLeft"
              } mx-auto w-xl grid grid-cols-2 gap-18 h-32 mb-10`}
            >
              <div className="hover:cursor-pointer bg-[url('/frame2.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4">
                <div className="text-md text-center text-white font-bold">
                  Let's text!
                </div>
              </div>
              <div className="hover:cursor-pointer bg-[url('/frame1.png')] bg-cover bg-center w-full h-full rounded-xl flex items-center justify-center p-4">
                <div className="text-md text-center text-white font-bold">
                  Let's call!
                </div>
              </div>
            </div>
          </>
        )}
        <div className="mx-auto w-48 flex gap-2">
          <Button
            className="w-1/2 bg-[#B4933F] hover:bg-[#947627] hover:cursor-pointer"
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
            className="w-1/2 bg-[#B4933F] hover:bg-[#947627] hover:cursor-pointer"
            type="submit"
            onClick={() => {
              progressStep(step, "next");
            }}
          >
            Next
            <MoveRight></MoveRight>
          </Button>
        </div>
      </div>
    </>
  );
}
