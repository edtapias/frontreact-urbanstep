import axios from "axios";

const catalogoApi = axios.create({
  baseURL: "/api/zapatillas",
  headers: {
    Accept: "application/json",
  },
  timeout: 15000,
});

export interface Zapatilla {
  id: number;
  nombre: string;
  marca: string;
  color: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  talla: string;
  categoria?: {
    id: number;
    nombre: string;
  };
}

const CatalogoService = {
  listar: async (): Promise<Zapatilla[]> => {
    const respuesta = await catalogoApi.get("");

    return Array.isArray(respuesta.data)
      ? respuesta.data
      : respuesta.data.content ?? [];
  },
};

export default CatalogoService;