import { crearClienteApi } from "../lib/api";

const usuariosApi = crearClienteApi("/api/usuarios");

export interface RegistroUsuarioDTO {
  nombre: string;
  correo: string;
  password: string;
  rut: string;
}

export interface LoginDTO {
  correo: string;
  password: string;
}

export interface ActualizarPerfilDTO {
  nombre: string;
  correo: string;
  rut: string;
  region?: string;
  comuna?: string;
  direccion?: string;
  referencias?: string;
}

export interface Usuario {
  id: number;
  rut: string;
  nombre: string;
  correo: string;
  rol: string;
  region?: string | null;
  comuna?: string | null;
  direccion?: string | null;
  referencias?: string | null;
}

/** El login devuelve los datos del usuario mas el JWT. */
export interface LoginResponse extends Usuario {
  token: string;
}

const UsuariosService = {
  registrar: async (datos: RegistroUsuarioDTO): Promise<Usuario> => {
    const respuesta = await usuariosApi.post<Usuario>(
      "/registro",
      datos
    );
    return respuesta.data;
  },

  iniciarSesion: async (datos: LoginDTO): Promise<LoginResponse> => {
    const respuesta = await usuariosApi.post<LoginResponse>(
      "/login",
      datos
    );
    return respuesta.data;
  },

  obtener: async (id: number): Promise<Usuario> => {
    const respuesta = await usuariosApi.get<Usuario>(`/${id}`);
    return respuesta.data;
  },

  actualizar: async (
    id: number,
    datos: ActualizarPerfilDTO
  ): Promise<Usuario> => {
    const respuesta = await usuariosApi.put<Usuario>(
      `/${id}`,
      datos
    );
    return respuesta.data;
  },
};

export default UsuariosService;