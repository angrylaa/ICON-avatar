import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function getKnowledge(
  table: string,
  token?: string | null
): Promise<any> {
  try {
    const authToken =
      token ??
      (typeof window !== "undefined"
        ? localStorage.getItem("token")
        : undefined);
    const res = await fetch(`${API_URL}/knowledge/${table}`, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to fetch knowledge");
    const data = await res.json();
    if (Array.isArray(data.data)) {
      data.data = data.data.map((row: any) => ({ ...row, table: table }));
    }
    toast.success("Knowledge loaded successfully");
    return { ...data, table };
  } catch (err: any) {
    toast.error(err?.message || "Failed to fetch knowledge");
    throw err;
  }
}

export interface KnowledgeData {
  [key: string]: any;
}

export async function createKnowledge(
  table: string,
  data: KnowledgeData,
  token?: string
): Promise<any> {
  try {
    const authToken =
      token ??
      (typeof window !== "undefined"
        ? localStorage.getItem("token")
        : undefined);
    const res = await fetch(`${API_URL}/knowledge/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create knowledge entry");
    toast.success("Knowledge entry created successfully");
    return res.json();
  } catch (err: any) {
    toast.error(err?.message || "Failed to create knowledge entry");
    throw err;
  }
}

export async function deleteKnowledge(
  table: string,
  id: string | number,
  token?: string
): Promise<any> {
  try {
    const authToken =
      token ??
      (typeof window !== "undefined"
        ? localStorage.getItem("token")
        : undefined);
    const res = await fetch(`${API_URL}/knowledge/${table}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to delete knowledge entry");
    toast.success("Knowledge entry deleted. Restarting in 5s...");
    setTimeout(() => {
      window.location.reload();
    }, 5000);
    return res.json();
  } catch (err: any) {
    toast.error(err?.message || "Failed to delete knowledge entry");
    throw err;
  }
}
