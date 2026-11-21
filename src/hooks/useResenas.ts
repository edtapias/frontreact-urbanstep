
import { useCallback, useEffect, useState } from "react";
import { ResenasService } from "../services/ResenasService";
import type {
  Resena,
  NuevaResena,
} from "../services/ResenasService";

export function useResenas(zapatillaId: number) {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar reseñas de la zapatilla
  const cargarResenas = useCallback(
    async (puntuacion?: number) => {
      try {
        setLoading(true);
        setError("");

        const datos = await ResenasService.obtenerPorZapatilla(
          zapatillaId,
          puntuacion
        );

        setResenas(datos);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las reseñas"
        );
        setResenas([]);
      } finally {
        setLoading(false);
      }
    },
    [zapatillaId]
  );

  // Cargar automáticamente al seleccionar una zapatilla
  useEffect(() => {
    cargarResenas();
  }, [cargarResenas]);

  // Publicar una reseña
  const publicarResena = async (datos: NuevaResena): Promise<boolean> => {
    try {
      await ResenasService.crear(datos);
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo publicar la reseña"
      );
      return false;
    }
  };

  return {
    resenas,
    loading,
    error,
    cargarResenas,
    publicarResena,
  };
}
