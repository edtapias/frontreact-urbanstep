import axios from "axios";

const api = axios.create({
  baseURL: "/api/pedidos",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export interface DetallePedido {
  id: number;
  productoId: number;
  nombreProducto: string;
  talla: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  id: number;
  clienteId: number;
  fechaCreacion: string;
  fechaEntrega: string | null;
  estado: string;
  total: number;
  costoEnvio: number;
  detalles: DetallePedido[];
}

export type MetodoEnvio =
  | "DOMICILIO"
  | "RETIRO_TIENDA";

const PedidosService = {
  // LISTAR PEDIDOS PARA ADMIN
  listarAdmin: async (): Promise<Pedido[]> => {
    const response = await api.get<Pedido[]>("/admin");
    return response.data;
  },

  // LISTAR PEDIDOS DEL CLIENTE
  listarPorCliente: async (
    clienteId: number
  ): Promise<Pedido[]> => {
    const response = await api.get<Pedido[]>(
      `/cliente/${clienteId}`
    );

    return response.data;
  },

  // CREAR PEDIDO
  crear: async (
    clienteId: number,
    costoEnvio: number,
    metodoEnvio: MetodoEnvio
  ): Promise<Pedido> => {
    const response = await api.post<Pedido>("", {
      clienteId,
      costoEnvio,
      metodoEnvio,
    });

    return response.data;
  },

  // ACTUALIZAR ESTADO
  actualizarEstado: async (
    id: number,
    estado: string
  ): Promise<Pedido> => {
    const response = await api.patch<Pedido>(
      `/${id}/estado`,
      { estado }
    );

    return response.data;
  },

  // CANCELAR PEDIDO
  cancelar: async (
    id: number,
    clienteId: number
  ): Promise<Pedido> => {
    const response = await api.patch<Pedido>(
      `/${id}/cancelar`,
      null,
      {
        params: { clienteId },
      }
    );

    return response.data;
  },
};

export default PedidosService;