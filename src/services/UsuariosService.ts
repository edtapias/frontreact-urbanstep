import axios from "axios";

const usuariosApi = axios.create({
  baseURL: "/api/usuarios",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

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

const UsuariosService = {
  registrar: async (datos: RegistroUsuarioDTO): Promise<Usuario> => {
    const respuesta = await usuariosApi.post<Usuario>(
      "/registro",
      datos
    );
    return respuesta.data;
  },

  iniciarSesion: async (datos: LoginDTO): Promise<Usuario> => {
    const respuesta = await usuariosApi.post<Usuario>(
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