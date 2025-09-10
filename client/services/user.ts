/**
 * User Service
 * Handles API requests for user authentication, profile management, and admin actions.
 */

// src/api/user.ts
export type Role = "user" | "admin";

export type User = {
  id: number;
  email: string;
  role: Role;
  createdAt?: string;
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function getToken(): string | undefined {
  const t =
    typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  return t === null ? undefined : t;
}

// Optional: pass a token if you’re doing bearer auth.
// If you’re using httpOnly cookies instead, remove the Authorization header
// and uncomment `credentials: "include"` below.
async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const authToken = token ?? getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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

/** Get the currently logged-in user’s profile */
export async function getMe(): Promise<{ user: User }> {
  return request<{ user: User }>("/auth/me", { method: "GET" });
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

/** Delete a user by ID */
export async function deleteUserApi(
  id: number,
  token?: string
): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/users/${id}`, { method: "DELETE" }, token);
}

/** Create a new user (admin) */
export async function createUser(input: {
  email: string;
  password: string;
  role?: Role;
}): Promise<{ user: User }> {
  return registerUser(input);
}

/** Update an existing user */
export async function updateUserApi(
  id: number,
  input: { email?: string; password?: string; role?: Role },
  token?: string
): Promise<{ ok: true }> {
  return request<{ ok: true }>(
    `/users/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
    token
  );
}

/** Logout the current user */
export async function logoutUser(): Promise<{ ok: true }> {
  return request<{ ok: true }>("/auth/logout", { method: "POST" });
}
