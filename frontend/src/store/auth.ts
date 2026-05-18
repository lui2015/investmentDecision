import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  username: string;
  nickname: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      isLoggedIn: () => !!get().token,
    }),
    { name: 'investment-auth' }
  )
);

// API base URL
const API_BASE = import.meta.env.PROD
  ? '/investmentDecision/api'
  : 'http://localhost:3001/api';

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new Error('登录已过期');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

export async function login(username: string, password: string) {
  const data = await apiRequest('/user/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  useAuthStore.getState().setAuth(data.token, data.user);
  return data;
}

export async function register(username: string, password: string, nickname?: string) {
  const data = await apiRequest('/user/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, nickname }),
  });
  useAuthStore.getState().setAuth(data.token, data.user);
  return data;
}
