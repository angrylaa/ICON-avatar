import { Router } from "express";
import { requireAuth, requireRole } from "../utils/admin.js";
import { messageAI } from "../controller/conversation.controller.js";

const router = Router();

// Only admin can create, update, delete
router.post("/send-message", requireAuth, messageAI);

export default router;
