import { Router } from "express";
import { requireAuth, requireRole } from "../utils/admin.js";

const router = Router();

// Only admin can create, update, delete
router.post("/:table", requireAuth, createKnowledge);

export default router;
