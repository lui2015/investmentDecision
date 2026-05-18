import { Router, Response } from 'express';
import { getDb, saveDb } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

// 获取用户所有决策表
router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const result = db.exec(`SELECT id, data FROM decision_sheets WHERE user_id = ? ORDER BY updated_at DESC`, [req.user!.userId]);
  if (result.length === 0) { res.json([]); return; }
  const sheets = result[0].values.map(row => ({ ...JSON.parse(row[1] as string), id: row[0] }));
  res.json(sheets);
});

// 创建/更新决策表
router.put('/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const sheetData = req.body;
  const db = getDb();

  const existing = db.exec(`SELECT user_id FROM decision_sheets WHERE id = ?`, [id]);
  if (existing.length > 0 && existing[0].values.length > 0) {
    if ((existing[0].values[0][0] as number) !== req.user!.userId) { res.status(403).json({ error: '无权修改' }); return; }
    db.run(`UPDATE decision_sheets SET data = ?, updated_at = datetime('now') WHERE id = ?`, [JSON.stringify(sheetData), id]);
  } else {
    db.run(`INSERT INTO decision_sheets (id, user_id, data) VALUES (?, ?, ?)`, [id, req.user!.userId, JSON.stringify(sheetData)]);
  }
  saveDb();
  res.json({ ok: true });
});

// 删除决策表
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const existing = db.exec(`SELECT user_id FROM decision_sheets WHERE id = ?`, [id]);
  if (existing.length === 0 || existing[0].values.length === 0) { res.status(404).json({ error: '不存在' }); return; }
  if ((existing[0].values[0][0] as number) !== req.user!.userId) { res.status(403).json({ error: '无权删除' }); return; }
  db.run(`DELETE FROM decision_sheets WHERE id = ?`, [id]);
  saveDb();
  res.json({ ok: true });
});

export default router;
