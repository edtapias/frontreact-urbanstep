
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
  const [todosUsuarios, setTodosUsuarios] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // CARGAR TODOS LOS USUARIOS DESDE EL BACKEND
  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const response = await usuariosApi.get("");

      setUsuarios(response.data);
      setTodosUsuarios(response.data);

      console.log("Usuarios cargados:", response.data);

    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError("No fue posible cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  }, []);

  // BUSCAR USUARIOS POR NOMBRE, RUT, CORREO O ROL
  const buscarUsuarios = useCallback(
    (texto: string) => {
      const busqueda = texto.trim().toLowerCase();

      if (!busqueda) {
        setUsuarios(todosUsuarios);
        setError("");
        return;
      }

      const resultado = todosUsuarios.filter((usuario) => {
        return (
          usuario.nombre?.toLowerCase().includes(busqueda) ||
          usuario.correo?.toLowerCase().includes(busqueda) ||
          usuario.rut?.toLowerCase().includes(busqueda) ||
          usuario.rol?.toLowerCase().includes(busqueda)
        );
      });

      setUsuarios(resultado);
    },
    [todosUsuarios]
  );

  // ACTUALIZAR USUARIO
  const actualizarUsuario = async (
    rut: string,
    datos: Partial<UsuarioAdmin>
  ) => {
    try {
      setError("");

      await usuariosApi.put(
        `/${encodeURIComponent(rut)}`,
        datos
      );

      await cargarUsuarios();

      return true;

    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      setError("No fue posible actualizar el usuario.");
      return false;
    }
  };

  // DESACTIVAR USUARIO
  // Pendiente: implementar el endpoint correspondiente en el backend.
  const desactivarUsuario = async (_rut: string) => {
    setError(
      "La función de desactivar usuarios todavía no está implementada en el backend."
    );

    return false;
  };

  // CARGAR USUARIOS AL INICIAR EL HOOK
  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  return {
    usuarios,
    todosUsuarios,
    cargando,
    error,
    cargarUsuarios,
    buscarUsuarios,
    actualizarUsuario,
    desactivarUsuario,
  };
}
