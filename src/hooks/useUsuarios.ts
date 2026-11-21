
import { useCallback, useEffect, useState } from "react";
import usuariosApi from "../client/api/usuariosApi";

export interface UsuarioAdmin {
  id?: number;
  rut: string;
  nombre: string;
  correo: string;
  rol?: string;
  activo?: boolean;
}

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const response = await usuariosApi.get("");

      setUsuarios(response.data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError("No fue posible cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  }, []);

  const buscarUsuarios = useCallback(async (texto: string) => {
    try {
      setCargando(true);
      setError("");

      if (!texto.trim()) {
        await cargarUsuarios();
        return;
      }

      const response = await usuariosApi.get("/admin/buscar", {
        params: { texto },
      });

      setUsuarios(response.data);
    } catch (err) {
      console.error("Error al buscar usuarios:", err);
      setError("No fue posible buscar los usuarios.");
    } finally {
      setCargando(false);
    }
  }, [cargarUsuarios]);

  const actualizarUsuario = async (
    rut: string,
    datos: Partial<UsuarioAdmin>
  ) => {
    try {
      await usuariosApi.put(`/admin/${encodeURIComponent(rut)}`, datos);
      await cargarUsuarios();
      return true;
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      setError("No fue posible actualizar el usuario.");
      return false;
    }
  };

  const desactivarUsuario = async (rut: string) => {
    try {
      await usuariosApi.patch(
        `/admin/${encodeURIComponent(rut)}/desactivar`
      );

      await cargarUsuarios();
      return true;
    } catch (err) {
      console.error("Error al desactivar usuario:", err);
      setError("No fue posible desactivar el usuario.");
      return false;
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  return {
    usuarios,
    cargando,
    error,
    cargarUsuarios,
    buscarUsuarios,
    actualizarUsuario,
    desactivarUsuario,
  };
}
