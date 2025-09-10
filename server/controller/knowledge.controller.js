import { AppError } from "../utils/errors.js";
import { requireRole } from "../utils/admin.js";
import { db } from "../db/db.js";
import { users } from "../db/schema/users.js";
import { danielKnowledge } from "../db/schema/danielknowledge.js";
import { tylerKnowledge } from "../db/schema/tylerknowledge.js";
import { jennyKnowledge } from "../db/schema/jennyknowledge.js";
import { eq } from "drizzle-orm";

/**
 * Knowledge Controller for CRUD operations on persona knowledge bases.
 * Handles fetching, creating, updating, and deleting knowledge entries for admin and user access.
 */

// Helper to get table by name
function getKnowledgeTable(table) {
  if (table === "danielknowledge") return danielKnowledge;
  if (table === "tylerknowledge") return tylerKnowledge;
  if (table === "jennyknowledge") return jennyKnowledge;
  throw new AppError(400, "Invalid knowledge table");
}

/**
 * Create a new knowledge entry.
 * @param {Object} req - The request object containing parameters and body.
 * @param {Object} res - The response object for sending responses.
 * @param {Function} next - The next middleware function in the stack.
 */
export async function createKnowledge(req, res, next) {
  try {
    const { table } = req.params;
    const { title, body, tags } = req.body;
    const schema = getKnowledgeTable(table);
    const result = await db.insert(schema).values({ title, body, tags });
    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing knowledge entry.
 * @param {Object} req - The request object containing parameters and body.
 * @param {Object} res - The response object for sending responses.
 * @param {Function} next - The next middleware function in the stack.
 */
export async function updateKnowledge(req, res, next) {
  try {
    const { table, id } = req.params;
    const { title, body, tags } = req.body;
    const schema = getKnowledgeTable(table);
    await db
      .update(schema)
      .set({ title, body, tags })
      .where(eq(schema.id, Number(id)));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a knowledge entry.
 * @param {Object} req - The request object containing parameters.
 * @param {Object} res - The response object for sending responses.
 * @param {Function} next - The next middleware function in the stack.
 */
export async function deleteKnowledge(req, res, next) {
  try {
    const { table, id } = req.params;
    const schema = getKnowledgeTable(table);
    await db.delete(schema).where(eq(schema.id, Number(id)));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/**
 * Get knowledge entries for a specific table.
 * @param {Object} req - The request object containing parameters.
 * @param {Object} res - The response object for sending responses.
 * @param {Function} next - The next middleware function in the stack.
 */
export async function getKnowledge(req, res, next) {
  try {
    const { table } = req.params;
    const schema = getKnowledgeTable(table);
    const rows = await db.select().from(schema);
    // For each row, add table property
    const rowsWithTable = Array.isArray(rows)
      ? rows.map((row) => ({ ...row, table }))
      : rows;
    res.json({ data: rowsWithTable });
  } catch (err) {
    next(err);
  }
}
