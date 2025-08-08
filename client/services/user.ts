// src/api/user.ts
export type Role = "user" | "admin";

export type User = {
  id: number;
  email: string;
  role: Role;
  createdAt?: string;
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Optional: pass a token if you’re doing bearer auth.
// If you’re using httpOnly cookies instead, remove the Authorization header
// and uncomment `credentials: "include"` below.
async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    // credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data?.error || data?.message || "Request failed");
  return data as T;
}

/** Create a user account */
export async function registerUser(input: {
  email: string;
  password: string;
  role?: Role; // default handled server-side as "user"
}): Promise<{ user: User }> {
  return request<{ user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Login: returns user (and token if your API issues one) */
export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ user: User; token?: string }> {
  return request<{ user: User; token?: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Admin: get all users */
export async function getAllUsers(token?: string): Promise<User[]> {
  const { users } = await request<{ users: User[] }>(
    "/users",
    { method: "GET" },
    token
  );
  return users;
}
