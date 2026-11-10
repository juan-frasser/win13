const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type Rol = 'ESTUDIANTE' | 'EMPRESA' | 'ADMIN';
export const RUTA_POR_ROL: Record<Rol, string> = { ESTUDIANTE: '/estudiante', EMPRESA: '/empresa', ADMIN: '/admin' };

export const guardarSesion = (s: { accessToken: string; rol: Rol }) => localStorage.setItem('sesion', JSON.stringify(s));
export const cerrarSesion = () => localStorage.removeItem('sesion');
export const leerSesion = (): { accessToken: string; rol: Rol } | null => {
  try { return JSON.parse(localStorage.getItem('sesion') ?? 'null'); } catch { return null; }
};

export async function api<T = unknown>(ruta: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = leerSesion()?.accessToken;
  const res = await fetch(API + ruta, {
    method: opts.method ?? (opts.body ? 'POST' : 'GET'),
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Error de servidor');
  return data as T;
}
