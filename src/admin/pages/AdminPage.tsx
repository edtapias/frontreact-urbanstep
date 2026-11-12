
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router";

interface Pedido {
  id: number;
  clienteId?: number;
  total: number;
  estado: string;
  fecha?: string;
  fechaCreacion?: string;
}

interface ReporteVentas {
  ingresosTotales?: number;
  totalVentas?: number;
  cantidadPedidos?: number;
  totalPedidos?: number;
}

const API = "/api";

const obtenerLista = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.pedidos)) return data.pedidos;
  if (Array.isArray(data?.productos)) return data.productos;
  if (Array.isArray(data?.usuarios)) return data.usuarios;
  return [];
};

const obtenerFecha = (fecha: Date) => {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
};

const obtenerMes = (fecha: Date) => {
  return fecha.toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });
};

const obtenerEstadoColor = (estado: string) => {
  switch (estado?.toUpperCase()) {
    case "PAGADO":
      return "bg-green-100 text-green-700";
    case "PENDIENTE":
      return "bg-yellow-100 text-yellow-700";
    case "CANCELADO":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function AdminPage() {
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });

  const [ventas, setVentas] = useState<ReporteVentas>({});
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [totalProductos, setTotalProductos] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [estados, setEstados] = useState<Record<string, number>>({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const hoy = new Date();
  const esMesActual =
    mesSeleccionado.getFullYear() === hoy.getFullYear() &&
    mesSeleccionado.getMonth() === hoy.getMonth();

  const mes = obtenerMes(mesSeleccionado);

  const cambiarMes = (cantidad: number) => {
    setMesSeleccionado(
      new Date(
        mesSeleccionado.getFullYear(),
        mesSeleccionado.getMonth() + cantidad,
        1
      )
    );
  };

  const cargarDashboard = useCallback(async () => {
    setCargando(true);
    setError("");

    const inicio = obtenerFecha(mesSeleccionado);

    const ultimoDia = new Date(
      mesSeleccionado.getFullYear(),
      mesSeleccionado.getMonth() + 1,
      0
    );

    const fin = esMesActual ? obtenerFecha(hoy) : obtenerFecha(ultimoDia);

    try {
      const resultados = await Promise.allSettled([
        axios.get(`${API}/reportes/ventas?inicio=${inicio}&fin=${fin}`),
        axios.get(`${API}/pedidos/admin`),
        axios.get(`${API}/zapatillas`),
        axios.get(`${API}/usuarios`),
        axios.get(`${API}/reportes/estados-pedidos`),
      ]);

      if (resultados[0].status === "fulfilled") {
        setVentas(resultados[0].value.data || {});
      } else {
        setVentas({});
        setError("No se pudieron cargar las ventas.");
      }

      if (resultados[1].status === "fulfilled") {
        setPedidos(obtenerLista(resultados[1].value.data));
      }

      if (resultados[2].status === "fulfilled") {
        setTotalProductos(obtenerLista(resultados[2].value.data).length);
      }

      if (resultados[3].status === "fulfilled") {
        setTotalClientes(obtenerLista(resultados[3].value.data).length);
      }

      if (resultados[4].status === "fulfilled") {
        setEstados(resultados[4].value.data || {});
      }
    } catch {
      setError("Ocurrió un error al cargar el dashboard.");
    } finally {
      setCargando(false);
    }
  }, [mesSeleccionado, esMesActual]);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  const ingresos =
    ventas.ingresosTotales ?? ventas.totalVentas ?? 0;

  const cantidadPedidos =
    ventas.cantidadPedidos ?? ventas.totalPedidos ?? 0;

  const pedidosRecientes = [...pedidos]
    .sort((a, b) => {
      const fechaA = new Date(a.fecha || a.fechaCreacion || 0).getTime();
      const fechaB = new Date(b.fecha || b.fechaCreacion || 0).getTime();
      return fechaB - fechaA;
    })
    .slice(0, 5);

  const formatoMoneda = (valor: number) =>
    valor.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });

  return (
    <div className="min-h-screen bg-[#f8f6f2] p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* ENCABEZADO */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              UrbanStep
            </h1>
            <p className="mt-1 text-gray-500">
              Panel de administración
            </p>
          </div>

          <button
            onClick={cargarDashboard}
            disabled={cargando}
            className="rounded-lg bg-[#292929] px-5 py-3 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {cargando ? "Actualizando..." : "↻ Actualizar"}
          </button>
        </div>

        {/* SELECTOR DE MES */}
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Ventas totales de {mes}
            </h2>
            <p className="text-sm text-gray-500">
              {esMesActual
                ? "Desde el primer día del mes hasta hoy"
                : "Resumen de ventas del mes seleccionado"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => cambiarMes(-1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              ‹ Anterior
            </button>

            <span className="min-w-28 text-center font-semibold capitalize text-gray-800">
              {mes}
            </span>

            <button
              onClick={() => cambiarMes(1)}
              disabled={esMesActual}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente ›
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* TARJETAS */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Ventas del mes</p>
            <h3 className="mt-3 text-2xl font-bold text-gray-800">
              {formatoMoneda(Number(ingresos))}
            </h3>
            <p className="mt-2 text-xs text-gray-400 capitalize">
              {mes}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Pedidos pagados del mes</p>
            <h3 className="mt-3 text-2xl font-bold text-gray-800">
              {cantidadPedidos}
            </h3>
            <p className="mt-2 text-xs text-gray-400">
              Según el reporte de ventas
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Productos registrados</p>
            <h3 className="mt-3 text-2xl font-bold text-gray-800">
              {totalProductos}
            </h3>
            <p className="mt-2 text-xs text-gray-400">
              Total general
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Clientes registrados</p>
            <h3 className="mt-3 text-2xl font-bold text-gray-800">
              {totalClientes}
            </h3>
            <p className="mt-2 text-xs text-gray-400">
              Total general
            </p>
          </div>
        </div>

        {/* PEDIDOS RECIENTES Y ACTIVIDAD */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Pedidos recientes
              </h2>
              <Link
                to="/admin/pedidos"
                className="text-sm font-medium text-gray-600 hover:underline"
              >
                Ver todos
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="p-3">Pedido</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosRecientes.map((pedido) => (
                    <tr key={pedido.id} className="border-b last:border-0">
                      <td className="p-3 font-medium">
                        #{pedido.id}
                      </td>
                      <td className="p-3">
                        {pedido.clienteId
                          ? `Cliente ${pedido.clienteId}`
                          : "Cliente"}
                      </td>
                      <td className="p-3">
                        {pedido.fecha || pedido.fechaCreacion
                          ? new Date(
                              pedido.fecha || pedido.fechaCreacion!
                            ).toLocaleDateString("es-CL")
                          : "-"}
                      </td>
                      <td className="p-3">
                        {formatoMoneda(Number(pedido.total || 0))}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${obtenerEstadoColor(pedido.estado)}`}
                        >
                          {pedido.estado}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {pedidosRecientes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400">
                        No hay pedidos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RESUMEN DE ACTIVIDAD */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-gray-800">
              Resumen de actividad
            </h2>

            <div className="space-y-5">
              {Object.entries(estados).map(([estado, cantidad]) => (
                <div key={estado}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="capitalize text-gray-600">
                      {estado.toLowerCase()}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {cantidad}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-[#b58b62]"
                      style={{
                        width: `${
                          Math.min(
                            100,
                            (Number(cantidad) /
                              Math.max(
                                1,
                                ...Object.values(estados).map(Number)
                              )) *
                              100
                          )
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              {Object.keys(estados).length === 0 && (
                <p className="text-sm text-gray-400">
                  No hay información de actividad.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ACCESOS RÁPIDOS */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-800">
            Accesos rápidos
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Link
              to="/admin/productos"
              className="rounded-lg border p-4 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Productos
            </Link>

            <Link
              to="/admin/inventario"
              className="rounded-lg border p-4 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Inventario
            </Link>

            <Link
              to="/admin/pedidos"
              className="rounded-lg border p-4 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Pedidos
            </Link>

            <Link
              to="/admin/reportes"
              className="rounded-lg border p-4 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reportes
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}