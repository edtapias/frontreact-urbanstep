
import { useCallback, useEffect, useState } from "react";
import FavoritosService from "../services/FavoritosService";

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [cargandoFavoritos, setCargandoFavoritos] = useState(false);
  const [errorFavoritos, setErrorFavoritos] = useState("");

  // Obtener el usuario que inició sesión.
  let usuarioId: number | null = null;

  try {
    const usuarioGuardado = localStorage.getItem("usuario");
    const usuario = usuarioGuardado
      ? JSON.parse(usuarioGuardado)
      : null;

    usuarioId = usuario?.id ? Number(usuario.id) : null;
  } catch {
    usuarioId = null;
  }

  // Recuperar favoritos desde la base de datos.
  const cargarFavoritos = useCallback(async () => {
    if (!usuarioId) {
      setFavoritos([]);
      return;
    }

    try {
      setCargandoFavoritos(true);
      setErrorFavoritos("");

      const datos = await FavoritosService.listar(usuarioId);

      setFavoritos(
        datos.map((favorito) => favorito.productoId)
      );
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      setErrorFavoritos("No se pudieron cargar tus favoritos.");
    } finally {
      setCargandoFavoritos(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    cargarFavoritos();
  }, [cargarFavoritos]);

  // Agregar o quitar una zapatilla.
  const toggleFavorito = async (productoId: number) => {
    if (!usuarioId) {
      return { requiereLogin: true, exito: false };
    }

    try {
      setErrorFavoritos("");

      if (favoritos.includes(productoId)) {
        await FavoritosService.eliminar(usuarioId, productoId);

        setFavoritos((actuales) =>
          actuales.filter((id) => id !== productoId)
        );
      } else {
        await FavoritosService.agregar(usuarioId, {
          productoId,
        });

        setFavoritos((actuales) => [...actuales, productoId]);
      }

      return { requiereLogin: false, exito: true };

    } catch (error) {
      console.error("Error al actualizar favoritos:", error);
      setErrorFavoritos("No se pudo actualizar el favorito.");

      return { requiereLogin: false, exito: false };
    }
  };

  return {
    favoritos,
    cargandoFavoritos,
    errorFavoritos,
    toggleFavorito,
    cargarFavoritos,
    usuarioId,
  };
}
