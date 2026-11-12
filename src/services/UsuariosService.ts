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
}

export interface Usuario {
  id: number;
  rut: string;
  nombre: string;
  correo: string;
  rol: string;
}

const UsuariosService = {
  registrar: async (datos: RegistroUsuarioDTO): Promise<Usuario> => {
    const respuesta = await usuariosApi.post("/registro", datos);
    return respuesta.data;
  },

  iniciarSesion: async (datos: LoginDTO): Promise<Usuario> => {
    const respuesta = await usuariosApi.post("/login", datos);
    return respuesta.data;
  },

  obtener: async (id: number): Promise<Usuario> => {
    const respuesta = await usuariosApi.get(`/${id}`);
    return respuesta.data;
  },

  actualizar: async (
    id: number,
    datos: ActualizarPerfilDTO
  ): Promise<Usuario> => {
    const respuesta = await usuariosApi.put(`/${id}`, datos);
    return respuesta.data;
  },
};

export default UsuariosService;