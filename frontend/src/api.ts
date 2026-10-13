export type User = {
    id: string;
    email: string;
    name: string;
    plan: string;
  };
  
  export type AuthResponse = {
    accessToken: string;
    user: User;
  };
  
  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
  const TOKEN_KEY = 'engo.token';
  const USER_KEY = 'engo.user';
  
  // хранилище
  export const authStorage = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  
    getUser: (): User | null => {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    setUser: (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  
    clear: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  };
  
  // базовый запрос
  async function request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = authStorage.getToken();
  
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };
  
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  
    const data = await res.json().catch(() => null);
  
    if (!res.ok) {
      if (res.status === 401) {
        authStorage.clear();
      }
      const message =
        (data && (data.message || data.error)) || 'Ошибка запроса';
      throw new Error(Array.isArray(message) ? message[0] : message);
    }
  
    return data as T;
  }
  
  // API методы
  export const api = {
    register: (body: { email: string; password: string; name: string }) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  
    login: (body: { email: string; password: string }) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  
    me: () => request<User>('/auth/me'),
  };