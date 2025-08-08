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

// GET /users
export async function getUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
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
    const result = await userService.editUser(Number(id), {
      email,
      password,
      role,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}
