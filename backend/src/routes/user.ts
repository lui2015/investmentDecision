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

  // 检查用户是否已存在
  const checkStmt = db.prepare(`SELECT id FROM users WHERE username = $username`);
  checkStmt.bind({ $username: username });
  if (checkStmt.step()) {
    checkStmt.free();
    res.status(409).json({ error: '用户名已存在' });
    return;
  }
  checkStmt.free();

  const hash = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (username, password_hash, nickname) VALUES (?, ?, ?)`, [username, hash, nickname || username]);
  saveDb();

  // 获取新用户ID
  const idStmt = db.prepare(`SELECT last_insert_rowid() as id`);
  idStmt.step();
  const idRow = idStmt.getAsObject();
  idStmt.free();
  const userId = idRow.id as number;

  const token = signToken({ userId, username });
  res.json({ token, user: { id: userId, username, nickname: nickname || username } });
});

// 登录
router.post('/login', (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) { res.status(400).json({ error: '用户名和密码不能为空' }); return; }

  const db = getDb();
  const stmt = db.prepare(`SELECT id, username, password_hash, nickname FROM users WHERE username = $username`);
  stmt.bind({ $username: username });
  if (!stmt.step()) {
    stmt.free();
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }
  const user = stmt.getAsObject() as { id: number; username: string; password_hash: string; nickname: string };
  stmt.free();

  if (!bcrypt.compareSync(password, user.password_hash)) { res.status(401).json({ error: '用户名或密码错误' }); return; }

  const token = signToken({ userId: user.id, username: user.username });
  res.json({ token, user: { id: user.id, username: user.username, nickname: user.nickname } });
});

// 获取当前用户信息
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const stmt = db.prepare(`SELECT id, username, nickname, created_at FROM users WHERE id = $id`);
  stmt.bind({ $id: req.user!.userId });
  if (!stmt.step()) { stmt.free(); res.status(404).json({ error: '用户不存在' }); return; }
  const row = stmt.getAsObject();
  stmt.free();
  res.json(row);
});

export default router;
