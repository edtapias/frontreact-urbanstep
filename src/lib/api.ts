import axios, { type InternalAxiosRequestConfig } from "axios";
import { cerrarSesion, getToken, tokenExpirado } from "./auth";

type ConfigConReintento = InternalAxiosRequestConfig & { _retry?: boolean };

const esRutaPublica = (url: string): boolean =>
  url.includes("/api/usuarios/login") || url.includes("/api/usuarios/registro");

const urlCompleta = (config: ConfigConReintento): string =>
  `${config.baseURL ?? ""}${config.url ?? ""}`;

function sesionExpirada(url: string): void {
  cerrarSesion();
  if (!url.includes("/login") && !window.location.pathname.startsWith("/login")) {
    window.location.assign("/login?expirada=1");
  }
}

function manejarError401(error: unknown): void {
  const err = error as {
    response?: { status?: number };
    config?: ConfigConReintento;
  };

  if (err?.response?.status !== 401 || !err.config) return;

  const config = err.config;
  const url = urlCompleta(config);
  if (config._retry || esRutaPublica(url)) return;

  config._retry = true;
  sesionExpirada(url);
}

/**
 * Cliente Axios con Authorization y cierre de sesion automatico en 401.
 */
export function crearClienteApi(
  baseURL: string,
  headers: Record<string, string> = {}
) {
  const cliente = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    timeout: 15000,
  });

  cliente.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token && tokenExpirado(token) && !esRutaPublica(urlCompleta(config as ConfigConReintento))) {
      const configConReintento = config as ConfigConReintento;
      configConReintento._retry = true;
      sesionExpirada(urlCompleta(configConReintento));
      return config;
    }

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });

  cliente.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
      manejarError401(error);
      return Promise.reject(error);
    }
  );

  return cliente;
}

/**
 * Equivalente para los servicios que todavia usan fetch: adjunta el token y
 * aplica la misma politica de 401.
 */
export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();

  if (token && tokenExpirado(token) && !esRutaPublica(url)) {
    sesionExpirada(url);
  } else if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const respuesta = await fetch(url, { ...init, headers });

  if (respuesta.status === 401 && !esRutaPublica(url)) {
    sesionExpirada(url);
  }

  return respuesta;
}
