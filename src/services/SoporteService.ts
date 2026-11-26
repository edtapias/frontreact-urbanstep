import { apiFetch } from "../lib/api";

const API_URL = "/api/soporte";

export interface NuevaConsultaSoporte {
  nombre: string;
  correo: string;
  motivo: string;
  mensaje: string;
  clienteId?: number | null;
}

export interface ConsultaSoporte {
  id: number;
  clienteId?: number | null;
  nombre: string;
  correo: string;
  asunto: string;
  categoria: string;
  mensaje: string;
  estado: "PENDIENTE" | "EN_REVISION" | "RESPONDIDA" | "CERRADA" | string;
  fechaCreacion?: string;
}

export interface RespuestaSoporte {
  id: number;
  administradorId?: number | null;
  mensaje: string;
  fechaRespuesta?: string;
  fechaCreacion?: string;
}

export const SoporteService = {
  async enviarConsulta(datos: NuevaConsultaSoporte): Promise<ConsultaSoporte> {
    const nombre = datos.nombre.trim();
    const correo = datos.correo.trim();
    const motivo = datos.motivo.trim();
    const mensaje = datos.mensaje.trim();

    if (!nombre) throw new Error("Debes ingresar tu nombre completo");
    if (!correo) throw new Error("Debes ingresar tu correo electrónico");
    if (!motivo) throw new Error("Debes seleccionar un motivo de consulta");
    if (!mensaje) throw new Error("Debes escribir tu consulta");

    const respuesta = await apiFetch(`${API_URL}/solicitudes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clienteId: datos.clienteId ?? null,
        nombre,
        correo,
        asunto: motivo,
        categoria: motivo,
        mensaje,
      }),
    });

    if (!respuesta.ok) {
      const textoError = await respuesta.text();
      throw new Error(textoError || "No se pudo enviar la consulta a soporte");
    }

    return respuesta.json();
  },

  async listarPorCliente(clienteId: number): Promise<ConsultaSoporte[]> {
    const res = await apiFetch(`${API_URL}/clientes/${clienteId}/solicitudes`);
    if (!res.ok) {
      throw new Error("Error al cargar tus solicitudes de soporte");
    }
    return res.json();
  },

  async listarTodas(): Promise<ConsultaSoporte[]> {
    const res = await apiFetch(`${API_URL}/admin/solicitudes`);
    if (!res.ok) {
      throw new Error("Error al cargar las solicitudes de soporte");
    }
    return res.json();
  },

  async listarRespuestas(solicitudId: number): Promise<RespuestaSoporte[]> {
    const res = await apiFetch(`${API_URL}/solicitudes/${solicitudId}/respuestas`);
    if (!res.ok) {
      throw new Error("Error al cargar las respuestas del ticket");
    }
    return res.json();
  },

  async responder(
    solicitudId: number,
    mensaje: string,
    administradorId?: number | null
  ): Promise<RespuestaSoporte> {
    if (!mensaje.trim()) {
      throw new Error("La respuesta no puede estar vacía");
    }

    const res = await apiFetch(
      `${API_URL}/admin/solicitudes/${solicitudId}/respuestas`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          administradorId: administradorId ?? null,
          mensaje: mensaje.trim(),
        }),
      }
    );

    if (!res.ok) {
      const textoError = await res.text();
      throw new Error(textoError || "No se pudo enviar la respuesta");
    }

    return res.json();
  },

  async actualizarEstado(
    solicitudId: number,
    estado: string
  ): Promise<ConsultaSoporte> {
    const res = await apiFetch(
      `${API_URL}/admin/solicitudes/${solicitudId}/estado`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      }
    );

    if (!res.ok) {
      const textoError = await res.text();
      throw new Error(textoError || "No se pudo actualizar el estado");
    }

    return res.json();
  },

  async actualizarCategoria(
    solicitudId: number,
    categoria: string
  ): Promise<ConsultaSoporte> {
    const res = await apiFetch(
      `${API_URL}/admin/solicitudes/${solicitudId}/categoria`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria }),
      }
    );

    if (!res.ok) {
      const textoError = await res.text();
      throw new Error(textoError || "No se pudo actualizar la categoría");
    }

    return res.json();
  },
};