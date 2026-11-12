
import axios from "axios";

const pagoApi = axios.create({
  baseURL: "/api/pagos",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ProductoCompra {
  zapatillaId: number;
  talla: string;
  cantidad: number;
}

export interface PagoRequest {
  pedidoId: number;
  usuarioId: number;
  montoTotal: number;
  metodoPago: string;
  rutFacturacion: string;
  nombreFacturacion: string;
  direccionFacturacion: string;
  productos: ProductoCompra[];
}

export interface Pago {
  id: number;
  pedidoId: number;
  usuarioId: number;
  montoTotal: number;
  metodoPago: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  rutFacturacion: string;
  nombreFacturacion: string;
  direccionFacturacion: string;
  comprobanteUrl?: string;
  fechaCreacion: string;
  fechaProcesamiento?: string;
}

const PagoService = {
  async iniciar(datos: PagoRequest): Promise<Pago> {
    const response = await pagoApi.post<Pago>("/iniciar", datos);
    return response.data;
  },

  async procesar(
    pagoId: number,
    aprobado: boolean
  ): Promise<Pago> {
    const response = await pagoApi.post<Pago>(
      `/${pagoId}/procesar`,
      null,
      {
        params: { aprobado },
      }
    );

    return response.data;
  },

  async historial(usuarioId: number): Promise<Pago[]> {
    const response = await pagoApi.get<Pago[]>(
      `/usuario/${usuarioId}`
    );

    return response.data;
  },
};

export default PagoService;
