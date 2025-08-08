import { Router } from "express";
import { getUsers, updateUser } from "../controller/user.controller.js";
import { requireAuth, requireRole } from "../utils/admin.js";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), getUsers);
router.put("/:id", requireAuth, requireRole("admin"), updateUser);

export default router;