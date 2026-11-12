
import { useCallback, useState } from "react";
import EnviosService from "../services/EnviosService";

import type {
  Envio,
  CrearEnvioDTO,
  TrackingDTO,
  ActualizarEstadoDTO,
  CotizacionEnvio,
} from "../services/EnviosService";

export function useEnvios() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [cotizacion, setCotizacion] = useState<CotizacionEnvio | null>(null);
  const [etiqueta, setEtiqueta] = useState<{
    mensaje: string;
    url_descarga: string;
  } | null>(null);

  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Consultar envío por ID de pedido
  const consultarPorPedido = async (pedidoId: number): Promise<Envio | null> => {
    try {
      setCargando(true);
      setError("");

      const datos = await EnviosService.consultarPorPedido(pedidoId);
      setEnvio(datos);

      return datos;
    } catch (err) {
      console.error("Error al consultar envío:", err);
      setError("No se pudo consultar el envío.");
      setEnvio(null);
      return null;
    } finally {
      setCargando(false);
    }
  };

  // Cotizar costo de envío
  const cotizar = async (
    region: string,
    comuna: string
  ): Promise<CotizacionEnvio | null> => {
    try {
      setCargando(true);
      setError("");

      const datos = await EnviosService.cotizar(region, comuna);
      setCotizacion(datos);

      return datos;
    } catch (err) {
      console.error("Error al cotizar envío:", err);
      setError("No se pudo calcular el costo del envío.");
      setCotizacion(null);
      return null;
    } finally {
      setCargando(false);
    }
  };

  // Registrar un envío
  const registrar = async (datos: CrearEnvioDTO): Promise<boolean> => {
    try {
      setCargando(true);
      setError("");

      const nuevoEnvio = await EnviosService.registrar(datos);

      setEnvios((actuales) => [...actuales, nuevoEnvio]);
      setEnvio(nuevoEnvio);

      return true;
    } catch (err) {
      console.error("Error al registrar envío:", err);
      setError("No se pudo registrar el envío.");
      return false;
    } finally {
      setCargando(false);
    }
  };

  // Asignar courier y número de seguimiento
  const asignarTracking = async (
    id: number,
    datos: TrackingDTO
  ): Promise<boolean> => {
    try {
      setCargando(true);
      setError("");

      const envioActualizado = await EnviosService.asignarTracking(id, datos);

      setEnvio(envioActualizado);
      setEnvios((actuales) =>
        actuales.map((item) =>
          item.id === id ? envioActualizado : item
        )
      );

      return true;
    } catch (err) {
      console.error("Error al asignar tracking:", err);
      setError("No se pudo asignar el número de seguimiento.");
      return false;
    } finally {
      setCargando(false);
    }
  };

  // Actualizar estado e incidencias
  const actualizarEstado = async (
    id: number,
    datos: ActualizarEstadoDTO
  ): Promise<boolean> => {
    try {
      setCargando(true);
      setError("");

      const envioActualizado = await EnviosService.actualizarEstado(id, datos);

      setEnvio(envioActualizado);
      setEnvios((actuales) =>
        actuales.map((item) =>
          item.id === id ? envioActualizado : item
        )
      );

      return true;
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      setError("No se pudo actualizar el estado del envío.");
      return false;
    } finally {
      setCargando(false);
    }
  };

  // Generar etiqueta de despacho
  const generarEtiqueta = async (id: number): Promise<boolean> => {
    try {
      setCargando(true);
      setError("");

      const datos = await EnviosService.generarEtiqueta(id);
      setEtiqueta(datos);

      return true;
    } catch (err) {
      console.error("Error al generar etiqueta:", err);
      setError("No se pudo generar la etiqueta.");
      return false;
    } finally {
      setCargando(false);
    }
  };

  // Limpiar mensajes y datos de consulta
  const limpiar = useCallback(() => {
    setError("");
    setEnvio(null);
    setCotizacion(null);
    setEtiqueta(null);
  }, []);

  return {
    envios,
    envio,
    cotizacion,
    etiqueta,
    cargando,
    error,
    consultarPorPedido,
    cotizar,
    registrar,
    asignarTracking,
    actualizarEstado,
    generarEtiqueta,
    limpiar,
  };
}

export default useEnvios;
