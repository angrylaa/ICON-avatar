import { validate, RegisterSchema } from "../utils/validate.js";
import { registerUser } from "../services/user.service.js";

export async function register(req, res, next) {
  try {
    const body = validate(RegisterSchema, req.body);
    const user = await registerUser(body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}
