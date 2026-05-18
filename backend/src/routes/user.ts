import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, saveDb } from '../db.js';
import { signToken, authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();

// 注册
router.post('/register', (req: AuthRequest, res: Response) => {
  const { username, password, nickname } = req.body;
  if (!username || !password) { res.status(400).json({ error: '用户名和密码不能为空' }); return; }
  if (username.length < 3 || password.length < 6) { res.status(400).json({ error: '用户名至少3位，密码至少6位' }); return; }

  const db = getDb();
  const existing = db.exec(`SELECT id FROM users WHERE username = '${username.replace(/'/g, "''")}'`);
  if (existing.length > 0 && existing[0].values.length > 0) { res.status(409).json({ error: '用户名已存在' }); return; }

  const hash = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (username, password_hash, nickname) VALUES (?, ?, ?)`, [username, hash, nickname || username]);
  saveDb();

  const result = db.exec(`SELECT last_insert_rowid() as id`);
  const userId = result[0].values[0][0] as number;
  const token = signToken({ userId, username });
  res.json({ token, user: { id: userId, username, nickname: nickname || username } });
});

// 登录
router.post('/login', (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) { res.status(400).json({ error: '用户名和密码不能为空' }); return; }

  const db = getDb();
  const result = db.exec(`SELECT id, username, password_hash, nickname FROM users WHERE username = ?`, [username]);
  if (result.length === 0 || result[0].values.length === 0) { res.status(401).json({ error: '用户名或密码错误' }); return; }

  const row = result[0].values[0];
  const user = { id: row[0] as number, username: row[1] as string, password_hash: row[2] as string, nickname: row[3] as string };

  if (!bcrypt.compareSync(password, user.password_hash)) { res.status(401).json({ error: '用户名或密码错误' }); return; }

  const token = signToken({ userId: user.id, username: user.username });
  res.json({ token, user: { id: user.id, username: user.username, nickname: user.nickname } });
});

// 获取当前用户信息
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const result = db.exec(`SELECT id, username, nickname, created_at FROM users WHERE id = ?`, [req.user!.userId]);
  if (result.length === 0 || result[0].values.length === 0) { res.status(404).json({ error: '用户不存在' }); return; }
  const row = result[0].values[0];
  res.json({ id: row[0], username: row[1], nickname: row[2], created_at: row[3] });
});

export default router;
