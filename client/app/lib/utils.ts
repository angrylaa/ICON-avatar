import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAuthToken(): string | undefined {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    return token ?? undefined;
  }
  return undefined;
}
