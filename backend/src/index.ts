import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import userRoutes from './routes/user.js';
import sheetsRoutes from './routes/sheets.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/sheets', sheetsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 初始化数据库后启动
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend running on http://0.0.0.0:${PORT}`);
  });
});
