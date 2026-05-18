import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import SheetListPage from './pages/SheetListPage';
import SheetEditor from './pages/SheetEditor';
import ValuationPage from './pages/ValuationPage';
import KnowledgePage from './pages/KnowledgePage';
import QuickDecisionPage from './pages/QuickDecisionPage';
import LoginPage from './pages/LoginPage';
import { useThemeStore, applyTheme, themes } from './store/theme';
import { useAuthStore } from './store/auth';
import { useSheetStore } from './store';

const navItems = [
  { path: '/', label: '总览', icon: '📊' },
  { path: '/sheets', label: '决策表', icon: '📋' },
  { path: '/valuation', label: '估值计算', icon: '🧮' },
  { path: '/knowledge', label: '知识库', icon: '📚' },
];

export default function App() {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/sheet/');
  const { themeId, setTheme } = useThemeStore();
  const { token, user, logout } = useAuthStore();
  const syncFromServer = useSheetStore(s => s.syncFromServer);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    applyTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  }, [themeId]);

  // 登录后从服务器同步数据
  useEffect(() => {
    if (token) {
      syncFromServer();
    }
  }, [token, syncFromServer]);

  // 路由变化时关闭菜单
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const currentTheme = themes.find(t => t.id === themeId)!;

  // 未登录显示登录页
  if (!token) {
    return (
      <div className="min-h-screen t-bg transition-colors duration-300">
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen t-bg transition-colors duration-300">
      {/* Top Navigation */}
      {!isEditor && (
        <header className="sticky top-0 z-30 t-nav-bg shadow-lg">
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-between h-12 sm:h-14">
              {/* Logo */}
              <h1 className={`text-sm sm:text-base font-bold t-nav-text flex-shrink-0 ${themeId === 'cyberpunk' ? 'glow-text' : ''}`}>
                💹 <span className="hidden xs:inline">投资决策系统</span><span className="xs:hidden">决策系统</span>
              </h1>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map(item => (
                  <NavLink key={item.path} to={item.path} end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                        isActive ? 't-nav-active font-medium' : 't-nav-text opacity-80 hover:opacity-100 hover:bg-white/10'
                      }`}>
                    <span>{item.icon}</span><span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="flex items-center gap-1">
                {/* User menu */}
                <div className="relative">
                  <button onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg t-nav-text opacity-80 hover:opacity-100 hover:bg-white/10 text-sm transition-all">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--t-accent-light)' }}>
                      {(user?.nickname || user?.username || '?')[0].toUpperCase()}
                    </span>
                    <span className="hidden sm:inline text-xs">{user?.nickname || user?.username}</span>
                  </button>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 z-50 t-card p-2 min-w-36 animate-fade-in">
                        <div className="px-3 py-2 text-xs t-muted border-b" style={{ borderColor: 'var(--t-border)' }}>
                          👤 {user?.nickname || user?.username}
                        </div>
                        <button onClick={() => { logout(); setShowUserMenu(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm t-text2 hover:t-bg3 transition-all mt-1">
                          退出登录
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Theme Switcher */}
                <div className="relative">
                  <button onClick={() => setShowThemePicker(!showThemePicker)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg t-nav-text opacity-80 hover:opacity-100 hover:bg-white/10 text-sm transition-all">
                    <span>{currentTheme.emoji}</span>
                    <span className="hidden sm:inline text-xs">{currentTheme.name}</span>
                    <span className="text-[10px]">▼</span>
                  </button>
                  {showThemePicker && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowThemePicker(false)} />
                      <div className="absolute right-0 top-full mt-2 z-50 t-card p-2 min-w-44 animate-fade-in">
                        <div className="text-xs t-muted px-2 py-1 mb-1">选择主题</div>
                        {themes.map(t => (
                          <button key={t.id} onClick={() => { setTheme(t.id); setShowThemePicker(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${themeId === t.id ? 't-accent-light font-medium' : ''}`}
                            style={themeId === t.id ? {} : { color: 'var(--t-text)' }}>
                            <span>{t.emoji}</span><span>{t.name}</span>
                            {themeId === t.id && <span className="ml-auto text-xs t-accent">✓</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile hamburger */}
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg t-nav-text opacity-80 hover:opacity-100 hover:bg-white/10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    }
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Nav Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 animate-fade-in">
              <div className="px-3 py-2 space-y-1">
                {navItems.map(item => (
                  <NavLink key={item.path} to={item.path} end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        isActive ? 't-nav-active font-medium' : 't-nav-text opacity-80'
                      }`}>
                    <span>{item.icon}</span><span>{item.label}</span>
                  </NavLink>
                ))}
                <button onClick={logout}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm t-nav-text opacity-80 w-full text-left">
                  <span>🚪</span><span>退出登录</span>
                </button>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Content */}
      <main className={isEditor ? '' : 'max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sheets" element={<SheetListPage />} />
          <Route path="/sheet/:id" element={<SheetEditor />} />
          <Route path="/quick" element={<QuickDecisionPage />} />
          <Route path="/valuation" element={<ValuationPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
        </Routes>
      </main>
    </div>
  );
}
