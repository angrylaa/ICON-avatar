import { Router } from "express";
import {
  getUsers,
  updateUser,
  deleteUser,
  updateUserRole as updateUserRoleController,
  resetUserPassword as resetUserPasswordController,
} from "../controller/user.controller.js";
import { requireAuth, requireRole } from "../utils/admin.js";

// All routes in this file are protected by requireAuth and requireRole('admin') middleware.
// Only authenticated admins can access these endpoints.

const router = Router();

router.get("/", requireAuth, requireRole("admin"), getUsers);
router.put("/:id", requireAuth, requireRole("admin"), updateUser);
router.put(
  "/:id/role",
  requireAuth,
  requireRole("admin"),
  updateUserRoleController
);
router.put(
  "/:id/password",
  requireAuth,
  requireRole("admin"),
  resetUserPasswordController
);
router.delete("/:id", requireAuth, requireRole("admin"), deleteUser);

export default router;
