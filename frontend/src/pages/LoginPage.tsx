import { useState } from 'react';
import { login, register } from '../store/auth';
import { useThemeStore } from '../store/theme';

export default function LoginPage() {
  const { themeId } = useThemeStore();
  const isCyber = themeId === 'cyberpunk';
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(username, password, nickname || undefined);
      } else {
        await login(username, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen t-bg flex items-center justify-center px-4">
      <div className={`w-full max-w-sm t-card p-6 sm:p-8 animate-fade-in ${isCyber ? 'glow-border' : ''}`}>
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💹</div>
          <h1 className={`text-xl font-bold t-text ${isCyber ? 'glow-text' : ''}`}>投资决策系统</h1>
          <p className="text-xs t-muted mt-1">先写理由，再下单</p>
        </div>

        {/* Tab */}
        <div className="flex rounded-lg overflow-hidden mb-5" style={{ border: '1px solid var(--t-border)' }}>
          <button onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium transition-all ${!isRegister ? 't-accent-bg text-white' : 't-bg2 t-text2'}`}>
            登录
          </button>
          <button onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium transition-all ${isRegister ? 't-accent-bg text-white' : 't-bg2 t-text2'}`}>
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs t-text2 mb-1.5">用户名</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="t-input w-full" placeholder="至少3位" autoComplete="username" required minLength={3} />
          </div>
          <div>
            <label className="block text-xs t-text2 mb-1.5">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="t-input w-full" placeholder="至少6位" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={6} />
          </div>
          {isRegister && (
            <div>
              <label className="block text-xs t-text2 mb-1.5">昵称（可选）</label>
              <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
                className="t-input w-full" placeholder="显示名称" />
            </div>
          )}

          {error && (
            <div className="text-xs t-danger px-3 py-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--t-danger) 10%, var(--t-bg-secondary))' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full t-btn-primary py-2.5 text-sm font-medium disabled:opacity-50">
            {loading ? '处理中...' : isRegister ? '注册' : '登录'}
          </button>
        </form>

        <p className="text-center text-[10px] t-muted mt-5">
          数据安全存储在服务器，多设备同步
        </p>
      </div>
    </div>
  );
}
