/**
 * Punto unico de lectura/escritura de la sesion JWT en localStorage.
 * El backend devuelve { ...usuario, token } en POST /api/usuarios/login.
 */

export const TOKEN_KEY = "token";
export const USER_KEY = "usuario";
export const EVENTO_SESION_CERRADA = "auth:sesion-cerrada";

export interface DatosSesion {
  token?: string;
  [clave: string]: unknown;
}

export function getToken(): string | null {
  const directo = localStorage.getItem(TOKEN_KEY);
  if (directo && directo.trim()) return directo.trim();

  // Compatibilidad con sesiones guardadas antes de la centralizacion.
  const guardado = localStorage.getItem(USER_KEY);
  if (!guardado) return null;

  try {
    const token = (JSON.parse(guardado) as DatosSesion)?.token;
    return typeof token === "string" && token.trim() ? token.trim() : null;
  } catch {
    return null;
  }
}

export function getUsuario<T = DatosSesion>(): T | null {
  const guardado = localStorage.getItem(USER_KEY);
  if (!guardado) return null;

  try {
    return JSON.parse(guardado) as T;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

/** Guarda el resultado del login (o registro) y el token por separado. */
export function guardarSesion<T extends object>(datos: T): void {
  const objeto = datos as T & { token?: string };
  const token = typeof objeto.token === "string" && objeto.token.trim()
    ? objeto.token.trim()
    : getToken();

  const usuario: Record<string, unknown> = { ...(datos as Record<string, unknown>) };
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    usuario.token = token; // compatibilidad con codigo legacy
  }
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

/** Actualiza los datos del usuario sin perder el token actual. */
export function guardarUsuario<T extends object>(usuario: T): void {
  const token = getToken();
  const copia: Record<string, unknown> = { ...(usuario as Record<string, unknown>) };
  if (token) copia.token = token;
  localStorage.setItem(USER_KEY, JSON.stringify(copia));
}

export function cerrarSesion(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(EVENTO_SESION_CERRADA));
}

export function escucharCierreSesion(callback: () => void): () => void {
  window.addEventListener(EVENTO_SESION_CERRADA, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENTO_SESION_CERRADA, callback);
    window.removeEventListener("storage", callback);
  };
}

/** true solo cuando el JWT tiene exp y ya vencio. Tokens opacos se ignoran. */
export function tokenExpirado(token: string | null = getToken()): boolean {
  if (!token) return false;

  try {
    const[, payload] = token.split(".");
    if (!payload) return false;

    const normalizado = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(normalizado)) as { exp?: number };
    return typeof claims.exp === "number" && claims.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}
