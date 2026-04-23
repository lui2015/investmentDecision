import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import SheetListPage from './pages/SheetListPage';
import SheetEditor from './pages/SheetEditor';
import ValuationPage from './pages/ValuationPage';
import KnowledgePage from './pages/KnowledgePage';
import { useThemeStore, applyTheme, themes } from './store/theme';

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
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    applyTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  }, [themeId]);

  const currentTheme = themes.find(t => t.id === themeId)!;

  return (
    <div className="min-h-screen t-bg transition-colors duration-300">
      {/* Top Navigation */}
      {!isEditor && (
        <header className="sticky top-0 z-30 t-nav-bg shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              {/* Logo + Nav */}
              <div className="flex items-center gap-6">
                <h1 className={`text-base font-bold t-nav-text ${themeId === 'cyberpunk' ? 'glow-text' : ''}`}>
                  💹 投资决策系统
                </h1>
                <nav className="flex items-center gap-1">
                  {navItems.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                          isActive ? 't-nav-active font-medium' : 't-nav-text opacity-80 hover:opacity-100 hover:bg-white/10'
                        }`
                      }
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Right: Theme Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg t-nav-text opacity-80 hover:opacity-100 hover:bg-white/10 text-sm transition-all"
                >
                  <span>{currentTheme.emoji}</span>
                  <span className="hidden sm:inline">{currentTheme.name}</span>
                  <span className="text-xs">▼</span>
                </button>

                {showThemePicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowThemePicker(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 t-card p-2 min-w-48 animate-in">
                      <div className="text-xs t-muted px-2 py-1 mb-1">选择主题</div>
                      {themes.map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setTheme(t.id); setShowThemePicker(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                            themeId === t.id ? 't-accent-light font-medium' : 'hover:t-bg3'
                          }`}
                          style={themeId === t.id ? {} : { color: 'var(--t-text)' }}
                        >
                          <span className="text-lg">{t.emoji}</span>
                          <span>{t.name}</span>
                          {themeId === t.id && <span className="ml-auto text-xs t-accent">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={isEditor ? '' : 'max-w-7xl mx-auto px-4 py-6'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
            <Route path="/sheets" element={<SheetListPage />} />
          <Route path="/sheet/:id" element={<SheetEditor />} />
          <Route path="/valuation" element={<ValuationPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
        </Routes>
      </main>
    </div>
  );
}
