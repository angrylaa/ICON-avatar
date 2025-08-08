import { Router } from "express";
import {
  register,
  getUsers,
  updateUser,
  login,
} from "../controller/user.controller.js";

const router = Router();

router.post("/register", register);
router.get("/", getUsers);
router.put("/:id", updateUser);
router.post("/login", login);

export default router;
