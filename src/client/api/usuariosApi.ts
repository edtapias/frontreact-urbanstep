import { crearClienteApi } from "../../lib/api";

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
  nombre?: string;
  correo?: string;
  password?: string;
}

export default usuariosApi;