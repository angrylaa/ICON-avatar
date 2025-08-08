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
