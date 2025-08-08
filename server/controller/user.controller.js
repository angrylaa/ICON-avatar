import { validate, RegisterSchema, LoginSchema } from "../utils/validate.js";
import {
  registerUser,
  loginWithEmailPassword,
  getAllUsers,
  editUser as editUserService,
  getUserById,
} from "../services/user.service.js";
import { signAuthToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";

export async function register(req, res, next) {
  try {
    const body = validate(RegisterSchema, req.body);
    const user = await registerUser(body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

// GET /users
export async function getUsers(_req, res, next) {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

// PUT /users/:id
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) throw new AppError(400, "Invalid user ID");

    const { email, password, role } = req.body;
    const result = await editUserService(Number(id), {
      email,
      password,
      role,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = validate(LoginSchema, req.body);
    const user = await loginWithEmailPassword(email, password);

    // Create JWT (contains minimal info)
    const token = signAuthToken({ sub: user.id, role: user.role });

    // Optional cookie (httpOnly)
    res.cookie("auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      path: "/",
    });

    return res.json({ user, token }); // return token too if you want SPA to store it
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    // req.user is set by requireAuth middleware
    const auth = req.user; // { sub, role }
    if (!auth?.sub) return res.status(401).json({ error: "Unauthorized" });
    const user = await getUserById(auth.sub);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) throw new AppError(400, "Invalid user ID");
    const { deleteUser: deleteUserService } = await import("../services/user.service.js");
    const result = await deleteUserService(Number(id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}
