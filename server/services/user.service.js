import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { users } from "../db/schema/users.js";
import { AppError } from "../utils/errors.js";

export async function registerUser({ email, password, role }) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length) throw new AppError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, 12);
  const finalRole = role ?? "user";

  try {
    await db.insert(users).values({ email, passwordHash, role: finalRole });
    const created = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const u = created[0];
    return { id: u.id, email: u.email, role: u.role, createdAt: u.createdAt };
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY")
      throw new AppError(409, "Email already registered");
    throw e;
  }
}

export async function loginWithEmailPassword(email, password) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const user = rows[0];
  if (!user) throw new AppError(401, "Invalid email or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError(401, "Invalid email or password");

  // Strip sensitive fields
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// Get all users (no password hashes)
export async function getAllUsers() {
  const all = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users);
  return all;
}

// Edit a user's data
export async function editUser(id, { email, password, role }) {
  const updates = {};

  if (email) updates.email = email;
  if (role) updates.role = role;
  if (password) {
    updates.passwordHash = await bcrypt.hash(password, 12);
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError(400, "No data provided to update");
  }

  const result = await db.update(users).set(updates).where(eq(users.id, id));

  if (result[0]?.affectedRows === 0) {
    throw new AppError(404, "User not found");
  }

  return { ok: true };
}
