import { Router } from "express";
import { requireAuth, requireRole } from "../utils/admin.js";
import {
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
} from "../controller/knowledge.controller.js";

const router = Router();

// Only admin can create, update, delete
router.post("/:table", requireAuth, requireRole("admin"), createKnowledge);
router.put("/:table/:id", requireAuth, requireRole("admin"), updateKnowledge);
router.delete(
  "/:table/:id",
  requireAuth,
  requireRole("admin"),
  deleteKnowledge
);

export default router;
