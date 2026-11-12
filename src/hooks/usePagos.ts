
import { useState } from "react";
import PagoService, {
  type Pago,
  type PagoRequest,
} from "../services/PagosService";

export function usePago() {
  const [pago, setPago] = useState<Pago | null>(null);
  const [historial, setHistorial] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Iniciar un pago
  const iniciarPago = async (datos: PagoRequest) => {
    try {
      setCargando(true);
      setError(null);

      const respuesta = await PagoService.iniciar(datos);
      setPago(respuesta);

      return respuesta;
    } catch (err: any) {
      const mensaje =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "No se pudo iniciar el pago.";

      setError(mensaje);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  // Procesar un pago
  const procesarPago = async (
    pagoId: number,
    aprobado: boolean
  ) => {
    try {
      setCargando(true);
      setError(null);

      const respuesta = await PagoService.procesar(
        pagoId,
        aprobado
      );

      setPago(respuesta);
      return respuesta;
    } catch (err: any) {
      const mensaje =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "No se pudo procesar el pago.";

      setError(mensaje);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  // Consultar historial de pagos
  const obtenerHistorial = async (usuarioId: number) => {
    try {
      setCargando(true);
      setError(null);

      const respuesta = await PagoService.historial(usuarioId);

      setHistorial(respuesta);
      return respuesta;
    } catch (err: any) {
      const mensaje =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "No se pudo obtener el historial de pagos.";

      setError(mensaje);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  return {
    pago,
    historial,
    cargando,
    error,
    iniciarPago,
    procesarPago,
    obtenerHistorial,
  };
}
