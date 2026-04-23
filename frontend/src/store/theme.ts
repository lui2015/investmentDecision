import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeId = 'default' | 'cyberpunk' | 'dark' | 'nature' | 'ocean' | 'warm';

export interface ThemeDef {
  id: ThemeId;
  name: string;
  emoji: string;
  // CSS variable values
  vars: Record<string, string>;
}

export const themes: ThemeDef[] = [
  {
    id: 'default', name: '经典', emoji: '🌤️',
    vars: {
      '--t-bg': '#f8fafc', '--t-bg-secondary': '#ffffff', '--t-bg-tertiary': '#f1f5f9',
      '--t-nav-bg': '#0f172a', '--t-nav-text': '#e2e8f0', '--t-nav-active': '#2563eb',
      '--t-text': '#1e293b', '--t-text-secondary': '#64748b', '--t-text-muted': '#94a3b8',
      '--t-border': '#e2e8f0', '--t-accent': '#2563eb', '--t-accent-hover': '#1d4ed8',
      '--t-accent-light': '#dbeafe', '--t-accent-text': '#1e40af',
      '--t-danger': '#ef4444', '--t-success': '#10b981', '--t-warning': '#f59e0b',
      '--t-card-shadow': '0 1px 3px rgba(0,0,0,0.06)', '--t-radius': '0.75rem',
      '--t-gradient-from': '#1e293b', '--t-gradient-to': '#334155',
      '--t-input-bg': '#ffffff', '--t-input-border': '#cbd5e1',
    },
  },
  {
    id: 'cyberpunk', name: '赛博朋克', emoji: '🌆',
    vars: {
      '--t-bg': '#0a0a1a', '--t-bg-secondary': '#12122a', '--t-bg-tertiary': '#1a1a3a',
      '--t-nav-bg': '#0d0d24', '--t-nav-text': '#a78bfa', '--t-nav-active': '#f43f5e',
      '--t-text': '#e0e0ff', '--t-text-secondary': '#a78bfa', '--t-text-muted': '#6d5acd',
      '--t-border': '#2d2d5a', '--t-accent': '#f43f5e', '--t-accent-hover': '#e11d48',
      '--t-accent-light': '#2a1030', '--t-accent-text': '#fb7185',
      '--t-danger': '#f43f5e', '--t-success': '#00ffc8', '--t-warning': '#fbbf24',
      '--t-card-shadow': '0 0 20px rgba(244,63,94,0.15), 0 0 4px rgba(167,139,250,0.1)',
      '--t-radius': '0.5rem',
      '--t-gradient-from': '#1a0030', '--t-gradient-to': '#0d0d24',
      '--t-input-bg': '#1a1a3a', '--t-input-border': '#3d3d6a',
    },
  },
  {
    id: 'dark', name: '暗夜', emoji: '🌙',
    vars: {
      '--t-bg': '#111827', '--t-bg-secondary': '#1f2937', '--t-bg-tertiary': '#374151',
      '--t-nav-bg': '#0f172a', '--t-nav-text': '#9ca3af', '--t-nav-active': '#3b82f6',
      '--t-text': '#f3f4f6', '--t-text-secondary': '#9ca3af', '--t-text-muted': '#6b7280',
      '--t-border': '#374151', '--t-accent': '#3b82f6', '--t-accent-hover': '#2563eb',
      '--t-accent-light': '#1e293b', '--t-accent-text': '#60a5fa',
      '--t-danger': '#ef4444', '--t-success': '#10b981', '--t-warning': '#f59e0b',
      '--t-card-shadow': '0 1px 4px rgba(0,0,0,0.3)', '--t-radius': '0.75rem',
      '--t-gradient-from': '#1e293b', '--t-gradient-to': '#0f172a',
      '--t-input-bg': '#1f2937', '--t-input-border': '#4b5563',
    },
  },
  {
    id: 'nature', name: '自然森林', emoji: '🌿',
    vars: {
      '--t-bg': '#f0fdf4', '--t-bg-secondary': '#ffffff', '--t-bg-tertiary': '#dcfce7',
      '--t-nav-bg': '#14532d', '--t-nav-text': '#bbf7d0', '--t-nav-active': '#16a34a',
      '--t-text': '#14532d', '--t-text-secondary': '#166534', '--t-text-muted': '#4ade80',
      '--t-border': '#bbf7d0', '--t-accent': '#16a34a', '--t-accent-hover': '#15803d',
      '--t-accent-light': '#dcfce7', '--t-accent-text': '#15803d',
      '--t-danger': '#dc2626', '--t-success': '#16a34a', '--t-warning': '#ca8a04',
      '--t-card-shadow': '0 1px 4px rgba(22,101,52,0.08)', '--t-radius': '1rem',
      '--t-gradient-from': '#14532d', '--t-gradient-to': '#166534',
      '--t-input-bg': '#ffffff', '--t-input-border': '#86efac',
    },
  },
  {
    id: 'ocean', name: '深海', emoji: '🌊',
    vars: {
      '--t-bg': '#0c1929', '--t-bg-secondary': '#0f2744', '--t-bg-tertiary': '#163660',
      '--t-nav-bg': '#091728', '--t-nav-text': '#7dd3fc', '--t-nav-active': '#0ea5e9',
      '--t-text': '#e0f2fe', '--t-text-secondary': '#7dd3fc', '--t-text-muted': '#38bdf8',
      '--t-border': '#1e3a5f', '--t-accent': '#0ea5e9', '--t-accent-hover': '#0284c7',
      '--t-accent-light': '#0c2d48', '--t-accent-text': '#38bdf8',
      '--t-danger': '#f87171', '--t-success': '#34d399', '--t-warning': '#fbbf24',
      '--t-card-shadow': '0 0 15px rgba(14,165,233,0.1)', '--t-radius': '0.75rem',
      '--t-gradient-from': '#0c1929', '--t-gradient-to': '#0f2744',
      '--t-input-bg': '#0f2744', '--t-input-border': '#1e3a5f',
    },
  },
  {
    id: 'warm', name: '暖阳', emoji: '☀️',
    vars: {
      '--t-bg': '#fffbeb', '--t-bg-secondary': '#ffffff', '--t-bg-tertiary': '#fef3c7',
      '--t-nav-bg': '#78350f', '--t-nav-text': '#fde68a', '--t-nav-active': '#d97706',
      '--t-text': '#451a03', '--t-text-secondary': '#92400e', '--t-text-muted': '#b45309',
      '--t-border': '#fde68a', '--t-accent': '#d97706', '--t-accent-hover': '#b45309',
      '--t-accent-light': '#fef3c7', '--t-accent-text': '#92400e',
      '--t-danger': '#dc2626', '--t-success': '#059669', '--t-warning': '#d97706',
      '--t-card-shadow': '0 1px 4px rgba(120,53,15,0.08)', '--t-radius': '1rem',
      '--t-gradient-from': '#78350f', '--t-gradient-to': '#92400e',
      '--t-input-bg': '#ffffff', '--t-input-border': '#fcd34d',
    },
  },
];

interface ThemeStore {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeId: 'cyberpunk',
      setTheme: (id) => set({ themeId: id }),
    }),
    { name: 'ids-theme' }
  )
);

export function applyTheme(id: ThemeId) {
  const theme = themes.find(t => t.id === id);
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

export function getTheme(id: ThemeId): ThemeDef {
  return themes.find(t => t.id === id) || themes[0];
}
