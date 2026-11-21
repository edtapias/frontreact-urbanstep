
import axios from "axios";

const favoritosApi = axios.create({
  baseURL: "/api/usuarios",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

export interface FavoritoDTO {
  productoId: number;
}

export interface Favorito {
  id: number;
  usuarioId: number;
  productoId: number;
}

const FavoritosService = {
  agregar: async (
    usuarioId: number,
    datos: FavoritoDTO
  ) => {
    const respuesta = await favoritosApi.post(
      `/${usuarioId}/favoritos`,
      datos
    );
    return respuesta.data;
  },

  listar: async (usuarioId: number): Promise<Favorito[]> => {
    const respuesta = await favoritosApi.get(
      `/${usuarioId}/favoritos`
    );
    return respuesta.data;
  },

  eliminar: async (
    usuarioId: number,
    productoId: number
  ) => {
    const respuesta = await favoritosApi.delete(
      `/${usuarioId}/favoritos/${productoId}`
    );
    return respuesta.data;
  },
};

export default FavoritosService;
