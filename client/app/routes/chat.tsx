import type { Route } from "./+types/home";
import { useRequireAuth } from "~/lib/useRequireAuth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chat" },
    { name: "description", content: "Chat with your AI Avatar" },
  ];
}

export default function Chat() {
  useRequireAuth();
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-2xl font-bold text-[#B4933F]">Chat Page</div>
    </div>
  );
}
