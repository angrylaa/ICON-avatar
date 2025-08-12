import { AppError } from "../utils/errors.js";
import { requireRole } from "../utils/admin.js";
import { db } from "../db/db.js";
import { users } from "../db/schema/users.js";

// Helper to get table by name
function getKnowledgeTable(table) {
  if (["danielknowledge", "tylerknowledge", "jennyknowledge"].includes(table)) {
    return table;
  }
  throw new AppError(400, "Invalid knowledge table");
}

export async function createKnowledge(req, res, next) {
  try {
    const { table } = req.params;
    const { title, body, tags } = req.body;
    const tbl = getKnowledgeTable(table);
    const result = await db.execute(
      `INSERT INTO ${tbl} (title, body, tags) VALUES (?, ?, ?)`,
      [title, body, JSON.stringify(tags)]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    next(err);
  }
}

export async function updateKnowledge(req, res, next) {
  try {
    const { table, id } = req.params;
    const { title, body, tags } = req.body;
    const tbl = getKnowledgeTable(table);
    await db.execute(`UPDATE ${tbl} SET title=?, body=?, tags=? WHERE id=?`, [
      title,
      body,
      JSON.stringify(tags),
      id,
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function deleteKnowledge(req, res, next) {
  try {
    const { table, id } = req.params;
    const tbl = getKnowledgeTable(table);
    await db.execute(`DELETE FROM ${tbl} WHERE id=?`, [id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
