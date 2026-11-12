
import { useState, useCallback } from "react";
import ReportesService from "../services/ReportesService";

export default function useReportes() {
  const [ventas, setVentas] = useState<any>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [estadosPedidos, setEstadosPedidos] = useState<Record<string, number>>({});
  const [inventario, setInventario] = useState<any[]>([]);
  const [bajoStock, setBajoStock] = useState<any[]>([]);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generarReportes = useCallback(
    async (inicio: string, fin: string) => {
      try {
        setCargando(true);
        setError(null);

        const [reporteVentas, reportePedidos, reporteEstados, reporteInventario, reporteBajoStock] =
          await Promise.all([
            ReportesService.obtenerVentas(inicio, fin),
            ReportesService.obtenerPedidos(inicio, fin),
            ReportesService.obtenerEstadosPedidos(),
            ReportesService.obtenerInventario(),
            ReportesService.obtenerBajoStock(5),
          ]);

        setVentas(reporteVentas);
        setPedidos(reportePedidos);
        setEstadosPedidos(reporteEstados);
        setInventario(reporteInventario);
        setBajoStock(reporteBajoStock);
      } catch (err) {
        console.error("Error al generar reportes:", err);
        setError("No se pudieron cargar los reportes. Verifica la conexión con el servidor.");
      } finally {
        setCargando(false);
      }
    },
    []
  );

  return {
    ventas,
    pedidos,
    estadosPedidos,
    inventario,
    bajoStock,
    cargando,
    error,
    generarReportes,
  };
}
