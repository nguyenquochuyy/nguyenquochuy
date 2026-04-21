import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function doRefresh(): Promise<string | null> {
  const { refreshToken, setAccessToken, logout } = useAuthStore.getState();
  if (!refreshToken) { logout(); return null; }

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) { logout(); return null; }

  const json = await res.json();
  if (json.success && json.accessToken) {
    setAccessToken(json.accessToken);
    return json.accessToken;
  }
  logout();
  return null;
}

export async function http<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const makeRequest = async (token: string | null): Promise<T> => {
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) reqHeaders['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, { ...options, headers: reqHeaders });

    if (res.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await doRefresh();
        isRefreshing = false;
        refreshQueue.forEach((cb) => cb(newToken ?? ''));
        refreshQueue = [];
        if (!newToken) throw new Error('Session hết hạn, vui lòng đăng nhập lại');
        return makeRequest(newToken);
      } else {
        return new Promise<T>((resolve, reject) => {
          refreshQueue.push(async (t) => {
            try { resolve(await makeRequest(t)); } catch (e) { reject(e); }
          });
        });
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    return res.json() as T;
  };

  return makeRequest(accessToken);
}

export const httpGet = <T>(path: string) => http<T>(path);
export const httpPost = <T>(path: string, body: unknown) =>
  http<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const httpPut = <T>(path: string, body: unknown) =>
  http<T>(path, { method: 'PUT', body: JSON.stringify(body) });
export const httpDelete = <T>(path: string) =>
  http<T>(path, { method: 'DELETE' });
