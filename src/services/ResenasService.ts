
const API_URL = "/api/resenas";

export interface Resena {
  id: number;
  pedidoId: number;
  zapatillaId: number;
  usuarioId: number;
  puntuacion: number;
  comentario: string;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  fechaCreacion: string;
}

export interface NuevaResena {
  pedidoId: number;
  zapatillaId: number;
  usuarioId: number;
  puntuacion: number;
  comentario: string;
}

type EstadoModeracion = "APROBADA" | "RECHAZADA";

export const ResenasService = {

  async crear(datos: NuevaResena): Promise<Resena> {
    if (!datos.pedidoId || !datos.zapatillaId || !datos.usuarioId)
      throw new Error("Faltan datos de la compra");

    if (datos.puntuacion < 1 || datos.puntuacion > 5)
      throw new Error("La puntuación debe estar entre 1 y 5");

    if (!datos.comentario.trim())
      throw new Error("Debes escribir un comentario");

    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!respuesta.ok)
      throw new Error(await respuesta.text() || "Error al crear la reseña");

    return respuesta.json();
  },

  async obtenerPorZapatilla(
    zapatillaId: number,
    puntuacion?: number
  ): Promise<Resena[]> {
    const query = puntuacion ? `?puntuacion=${puntuacion}` : "";
    const respuesta = await fetch(
      `${API_URL}/zapatilla/${zapatillaId}${query}`
    );

    if (!respuesta.ok) throw new Error("Error al obtener reseñas");

    return respuesta.json();
  },

  async obtenerPendientes(): Promise<Resena[]> {
    const respuesta = await fetch(`${API_URL}/pendientes`);

    if (!respuesta.ok) throw new Error("Error al obtener reseñas pendientes");

    return respuesta.json();
  },

  async moderar(id: number, estado: EstadoModeracion): Promise<Resena> {
    const respuesta = await fetch(`${API_URL}/${id}/moderar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });

    if (!respuesta.ok) throw new Error("Error al moderar la reseña");

    return respuesta.json();
  },
};
