import { Router, Response } from 'express';
import { getDb, saveDb } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

// 获取用户所有决策表
router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const stmt = db.prepare(`SELECT id, data FROM decision_sheets WHERE user_id = $userId ORDER BY updated_at DESC`);
  stmt.bind({ $userId: req.user!.userId });
  const sheets: unknown[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    try {
      sheets.push({ ...JSON.parse(row.data as string), id: row.id });
    } catch {
      sheets.push({ id: row.id });
    }
  }
  stmt.free();
  res.json(sheets);
});

// 创建/更新决策表
router.put('/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const sheetData = req.body;
  const db = getDb();

  // 检查是否已存在
  const checkStmt = db.prepare(`SELECT user_id FROM decision_sheets WHERE id = $id`);
  checkStmt.bind({ $id: id });
  if (checkStmt.step()) {
    const row = checkStmt.getAsObject();
    checkStmt.free();
    if ((row.user_id as number) !== req.user!.userId) { res.status(403).json({ error: '无权修改' }); return; }
    db.run(`UPDATE decision_sheets SET data = ?, updated_at = datetime('now') WHERE id = ?`, [JSON.stringify(sheetData), id]);
  } else {
    checkStmt.free();
    db.run(`INSERT INTO decision_sheets (id, user_id, data) VALUES (?, ?, ?)`, [id, req.user!.userId, JSON.stringify(sheetData)]);
  }
  saveDb();
  res.json({ ok: true });
});

// 删除决策表
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const checkStmt = db.prepare(`SELECT user_id FROM decision_sheets WHERE id = $id`);
  checkStmt.bind({ $id: id });
  if (!checkStmt.step()) { checkStmt.free(); res.status(404).json({ error: '不存在' }); return; }
  const row = checkStmt.getAsObject();
  checkStmt.free();
  if ((row.user_id as number) !== req.user!.userId) { res.status(403).json({ error: '无权删除' }); return; }
  db.run(`DELETE FROM decision_sheets WHERE id = ?`, [id]);
  saveDb();
  res.json({ ok: true });
});

export default router;
