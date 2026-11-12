
import axios from "axios";

const enviosApi = axios.create({
  baseURL: "/api/envios",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

export interface Envio {
  id: number;
  pedidoId: number;
  metodoEnvio: string;
  region: string;
  comuna: string;
  direccionCompleta: string;
  referencias: string;
  costo: number;
  courier: string | null;
  trackingNumber: string | null;
  estado: string;
  incidencias: string | null;
  fechaActualizacion: string;
}

export interface CotizacionEnvio {
  [key: string]: unknown;
}

export interface CrearEnvioDTO {
  pedidoId: number;
  metodoEnvio: "DOMICILIO" | "RETIRO_TIENDA";
  region?: string;
  comuna?: string;
  direccionCompleta?: string;
  referencias?: string;
  costo: number;
}

export interface TrackingDTO {
  courier: string;
  trackingNumber: string;
}

export interface ActualizarEstadoDTO {
  estado: string;
  incidencia?: string;
}

const EnviosService = {
  cotizar: async (
    region: string,
    comuna: string
  ): Promise<CotizacionEnvio> => {
    const { data } = await enviosApi.get("/cotizar", {
      params: { region, comuna },
    });

    return data;
  },

  registrar: async (envio: CrearEnvioDTO): Promise<Envio> => {
    const { data } = await enviosApi.post("", envio);
    return data;
  },

  consultarPorPedido: async (pedidoId: number): Promise<Envio> => {
    const { data } = await enviosApi.get(`/pedido/${pedidoId}`);
    return data;
  },

  asignarTracking: async (
    id: number,
    datos: TrackingDTO
  ): Promise<Envio> => {
    const { data } = await enviosApi.patch(`/${id}/tracking`, datos);
    return data;
  },

  actualizarEstado: async (
    id: number,
    datos: ActualizarEstadoDTO
  ): Promise<Envio> => {
    const { data } = await enviosApi.patch(`/${id}/estado`, datos);
    return data;
  },

  generarEtiqueta: async (
    id: number
  ): Promise<{ mensaje: string; url_descarga: string }> => {
    const { data } = await enviosApi.get(`/${id}/etiqueta`);
    return data;
  },
};

export default EnviosService;
