import { Router } from "express";
import {
  register,
  getUsers,
  updateUser,
} from "../controller/user.controller.js";

const router = Router();

router.post("/register", register);
router.get("/", getUsers);
router.put("/:id", updateUser);

export default router;
