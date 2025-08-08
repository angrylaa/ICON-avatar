import { z } from "zod";
import { AppError } from "./errors.js";

export const RegisterSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  role: z.enum(["user", "admin"]).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
});

export function validate(schema, data) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new AppError(400, "Invalid input");
  return parsed.data;
}
