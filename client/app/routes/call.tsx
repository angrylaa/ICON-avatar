import type { Route } from "./+types/home";
import { useRequireAuth } from "~/lib/useRequireAuth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Call" },
    { name: "description", content: "Call with your AI Avatar" },
  ];
}

export default function Call() {
  useRequireAuth();
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-2xl font-bold text-[#B4933F]">Call Page</div>
    </div>
  );
}
