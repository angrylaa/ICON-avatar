import { Router } from "express";
import { getUsers, updateUser, deleteUser } from "../controller/user.controller.js";
import { requireAuth, requireRole } from "../utils/admin.js";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), getUsers);
router.put("/:id", requireAuth, requireRole("admin"), updateUser);
router.delete("/:id", requireAuth, requireRole("admin"), deleteUser);

export default router;