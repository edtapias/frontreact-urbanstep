
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
  nombre?: string;
  correo?: string;
  password?: string;
}

export default usuariosApi;
