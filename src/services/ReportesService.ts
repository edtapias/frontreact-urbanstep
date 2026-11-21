
import axios from "axios";

const reportesApi = axios.create({
  baseURL: "/api/reportes",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

export interface ReporteVentas {
  inicio: string;
  fin: string;
  cantidadPedidos: number;
  ingresosTotales: number;
}

export interface ReportePedido {
  id: number;
  clienteId?: number;
  fechaCreacion: string;
  estado: string;
  total: number;
}

export interface ReporteInventario {
  id: number;
  nombre: string;
  stock: number;
  precio?: number;
  categoria?: string;
}

export interface ProductoVendido {
  id?: number;
  nombre?: string;
  cantidadVendida?: number;
  totalVendido?: number;
}

const ReportesService = {
  obtenerVentas: async (inicio: string, fin: string): Promise<ReporteVentas> => {
    const { data } = await reportesApi.get("/ventas", {
      params: { inicio, fin },
    });
    return data;
  },

  obtenerPedidos: async (inicio: string, fin: string): Promise<ReportePedido[]> => {
    const { data } = await reportesApi.get("/pedidos", {
      params: { inicio, fin },
    });
    return data;
  },

  obtenerEstadosPedidos: async (): Promise<Record<string, number>> => {
    const { data } = await reportesApi.get("/estados-pedidos");
    return data;
  },

  obtenerInventario: async (): Promise<ReporteInventario[]> => {
    const { data } = await reportesApi.get("/inventario");
    return data;
  },

  obtenerBajoStock: async (minimo: number = 5): Promise<ReporteInventario[]> => {
    const { data } = await reportesApi.get("/bajo-stock", {
      params: { minimo },
    });
    return data;
  },

  obtenerProductosMasVendidos: async (
    inicio: string,
    fin: string
  ): Promise<ProductoVendido[]> => {
    const { data } = await reportesApi.get("/productos-mas-vendidos", {
      params: { inicio, fin },
    });
    return data;
  },
};

export default ReportesService;
