import { Router } from "express";
import {
  register,
  login,
  me,
} from "../controller/user.controller.js";
import { requireAuth } from "../utils/admin.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);

export default router;
