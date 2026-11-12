
import { useCallback, useEffect, useState } from "react";

import {
  Search,
  Package,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  RefreshCw,
  X,
} from "lucide-react";

import InventarioService, {
  type Inventario,
  type MovimientoInventario,
} from "../../services/InventarioService";

import CatalogoService, {
  type Zapatilla,
} from "../../services/CatalogoService";

export default function InventarioPage() {
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [productos, setProductos] = useState<Zapatilla[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [registroSeleccionado, setRegistroSeleccionado] =
    useState<Inventario | null>(null);

  const [tipoMovimiento, setTipoMovimiento] =
    useState<"ENTRADA" | "SALIDA">("ENTRADA");

  const [cantidad, setCantidad] = useState("");
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [historial, setHistorial] =
    useState<MovimientoInventario[]>([]);

  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Consultar inventario y catálogo.
  const cargarInventario = useCallback(async (mostrarCarga = false) => {
    try {
      if (mostrarCarga) {
        setCargando(true);
      }

      setError("");

      const [datosInventario, datosProductos] = await Promise.all([
        InventarioService.listar(),
        CatalogoService.listar(),
      ]);

      setInventario(datosInventario);
      setProductos(datosProductos);
    } catch (err) {
      console.error("Error al cargar inventario:", err);

      setError(
        "No se pudo actualizar el inventario. Comprueba la conexión."
      );
    } finally {
      if (mostrarCarga) {
        setCargando(false);
      }
    }
  }, []);

  // Primera carga y actualización automática cada 5 segundos.
  useEffect(() => {
    cargarInventario(true);

    const intervalo = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        cargarInventario(false);
      }
    }, 5000);

    const actualizarAlVolver = () => {
      if (document.visibilityState === "visible") {
        cargarInventario(false);
      }
    };

    document.addEventListener("visibilitychange", actualizarAlVolver);

    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener(
        "visibilitychange",
        actualizarAlVolver
      );
    };
  }, [cargarInventario]);

  // Buscar zapatilla relacionada con el inventario.
  const obtenerZapatilla = (zapatillaId: number) => {
    return productos.find((producto) => producto.id === zapatillaId);
  };

  // Filtrar registros.
  const inventarioFiltrado = inventario.filter((item) => {
    const termino = busqueda.toLowerCase();
    const zapatilla = obtenerZapatilla(item.zapatillaId);

    return (
      String(item.zapatillaId).includes(termino) ||
      item.talla.toLowerCase().includes(termino) ||
      item.sucursal.toLowerCase().includes(termino) ||
      zapatilla?.nombre.toLowerCase().includes(termino) ||
      zapatilla?.marca.toLowerCase().includes(termino)
    );
  });

  // Indicadores.
  const totalUnidades = inventario.reduce(
    (total, item) => total + Number(item.cantidadDisponible),
    0
  );

  const stockCritico = inventario.filter(
    (item) =>
      Number(item.cantidadDisponible) <= Number(item.umbralMinimo)
  ).length;

  // Abrir formulario de movimiento.
  const abrirMovimiento = (
    item: Inventario,
    tipo: "ENTRADA" | "SALIDA"
  ) => {
    setRegistroSeleccionado(item);
    setTipoMovimiento(tipo);
    setCantidad("");
    setObservacion("");
    setMostrarHistorial(false);
  };

  // Registrar entrada o salida manual.
  const registrarMovimiento = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!registroSeleccionado) return;

    const cantidadNumerica = Number(cantidad);

    if (!Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      alert("Ingresa una cantidad entera mayor que cero.");
      return;
    }

    if (
      tipoMovimiento === "SALIDA" &&
      cantidadNumerica > registroSeleccionado.cantidadDisponible
    ) {
      alert("No existe stock suficiente para realizar esta salida.");
      return;
    }

    try {
      setGuardando(true);

      await InventarioService.registrarMovimiento(
        registroSeleccionado.id,
        {
          tipoMovimiento,
          cantidad: cantidadNumerica,
          observacion,
        }
      );

      alert("Movimiento registrado correctamente.");

      setRegistroSeleccionado(null);

      await cargarInventario(false);
    } catch (err: any) {
      console.error("Error al registrar movimiento:", err);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "No se pudo registrar el movimiento."
      );
    } finally {
      setGuardando(false);
    }
  };

  // Consultar historial.
  const verHistorial = async (item: Inventario) => {
    try {
      setRegistroSeleccionado(item);
      setCargandoHistorial(true);
      setHistorial([]);
      setMostrarHistorial(true);

      const datos = await InventarioService.consultarHistorial(item.id);

      setHistorial(datos);
    } catch (err) {
      console.error("Error al cargar historial:", err);

      alert("No se pudo cargar el historial.");

      setMostrarHistorial(false);
      setRegistroSeleccionado(null);
    } finally {
      setCargandoHistorial(false);
    }
  };

  // Cerrar ventanas.
  const cerrarModal = () => {
    setRegistroSeleccionado(null);
    setMostrarHistorial(false);
    setHistorial([]);
  };

  // Obtener URL de imagen.
  const obtenerImagen = (imagenUrl?: string) => {
    if (!imagenUrl) return "";

    if (
      imagenUrl.startsWith("http://") ||
      imagenUrl.startsWith("https://")
    ) {
      return imagenUrl;
    }

    return `http://localhost:8080/${imagenUrl.replace(/^\/+/, "")}`;
  };

  return (
    <div className="space-y-6">

      {/* ENCABEZADO */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#393632]">
            Gestión de inventario
          </h1>

          <p className="mt-1 text-sm text-[#77716A]">
            Administra las existencias y movimientos de tus zapatillas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => cargarInventario(true)}
          disabled={cargando}
          className="flex items-center gap-2 rounded-lg border border-[#E5E0D8] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[#F5F3EF] disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      {/* INDICADORES */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="rounded-xl border border-[#E5E0D8] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#77716A]">
                Unidades disponibles
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#393632]">
                {totalUnidades}
              </h2>
            </div>

            <Package size={30} className="text-[#766B5D]" />
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E0D8] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#77716A]">
                Registros con stock crítico
              </p>

              <h2 className="mt-2 text-3xl font-bold text-red-600">
                {stockCritico}
              </h2>
            </div>

            <AlertTriangle size={30} className="text-red-500" />
          </div>
        </div>

      </div>

      {/* BUSCADOR */}
      <div className="rounded-xl border border-[#E5E0D8] bg-white p-4">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-3 top-3 text-[#77716A]"
          />

          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por producto, marca, ID, talla o sucursal..."
            className="w-full rounded-lg border border-[#E5E0D8] py-2.5 pl-10 pr-4 outline-none focus:border-[#766B5D]"
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-hidden rounded-xl border border-[#E5E0D8] bg-white">

        <div className="border-b border-[#E5E0D8] p-5 flex justify-between">
          <h2 className="font-semibold text-[#393632]">
            Existencias de productos
          </h2>

          <span className="text-xs text-[#77716A]">
            Actualización automática cada 5 segundos
          </span>
        </div>

        {cargando ? (
          <p className="p-8 text-center text-[#77716A]">
            Cargando inventario...
          </p>
        ) : error && inventario.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => cargarInventario(true)}
              className="mt-3 rounded-lg bg-[#393632] px-4 py-2 text-sm text-white"
            >
              Reintentar
            </button>
          </div>
        ) : inventarioFiltrado.length === 0 ? (
          <p className="p-8 text-center text-[#77716A]">
            No se encontraron registros de inventario.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-[#F5F3EF] text-[#77716A]">
                <tr>
                  <th className="px-5 py-4">Producto</th>
                  <th className="px-5 py-4">Talla</th>
                  <th className="px-5 py-4">Sucursal</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Umbral mínimo</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {inventarioFiltrado.map((item) => {
                  const critico =
                    Number(item.cantidadDisponible) <=
                    Number(item.umbralMinimo);

                  const zapatilla = obtenerZapatilla(item.zapatillaId);

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-[#E5E0D8] hover:bg-[#FAF9F7]"
                    >

                      <td className="px-5 py-4">
                        <div className="flex min-w-[210px] items-center gap-3">

                          {zapatilla?.imagenUrl ? (
                            <img
                              src={obtenerImagen(zapatilla.imagenUrl)}
                              alt={zapatilla.nombre}
                              className="h-14 w-14 rounded-lg bg-[#F5F3EF] object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#F5F3EF]">
                              <Package
                                size={23}
                                className="text-[#766B5D]"
                              />
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-[#393632]">
                              {zapatilla?.nombre ||
                                `Zapatilla #${item.zapatillaId}`}
                            </p>

                            <p className="text-xs text-[#77716A]">
                              {zapatilla?.marca || "Marca no disponible"}
                            </p>

                            <p className="text-xs text-[#91897F]">
                              ID: #{item.zapatillaId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">{item.talla}</td>

                      <td className="px-5 py-4">{item.sucursal}</td>

                      <td className="px-5 py-4 font-semibold">
                        {item.cantidadDisponible}
                      </td>

                      <td className="px-5 py-4">
                        {item.umbralMinimo}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            critico
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {critico ? "Stock crítico" : "Disponible"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            title="Registrar entrada"
                            onClick={() =>
                              abrirMovimiento(item, "ENTRADA")
                            }
                            className="rounded-lg bg-green-50 p-2 text-green-700 hover:bg-green-100"
                          >
                            <ArrowDownCircle size={18} />
                          </button>

                          <button
                            type="button"
                            title="Registrar salida"
                            onClick={() =>
                              abrirMovimiento(item, "SALIDA")
                            }
                            className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100"
                          >
                            <ArrowUpCircle size={18} />
                          </button>

                          <button
                            type="button"
                            title="Ver historial"
                            onClick={() => verHistorial(item)}
                            className="rounded-lg bg-[#F5F3EF] p-2 text-[#766B5D] hover:bg-[#E5E0D8]"
                          >
                            <History size={18} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

        {error && inventario.length > 0 && (
          <p className="border-t border-red-100 bg-red-50 px-5 py-2 text-sm text-red-600">
            No se pudo actualizar la información más reciente: {error}
          </p>
        )}

      </div>

      {/* MODAL DE MOVIMIENTO */}
      {registroSeleccionado && !mostrarHistorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#393632]">
                Registrar {tipoMovimiento.toLowerCase()}
              </h2>

              <button
                type="button"
                onClick={cerrarModal}
                className="text-[#77716A] hover:text-[#393632]"
              >
                <X size={22} />
              </button>
            </div>

            <p className="mb-4 text-sm text-[#77716A]">
              {obtenerZapatilla(registroSeleccionado.zapatillaId)?.nombre ||
                `Zapatilla #${registroSeleccionado.zapatillaId}`}
              {" · "}
              Talla {registroSeleccionado.talla}
              {" · "}
              Stock actual: {registroSeleccionado.cantidadDisponible}
            </p>

            <form onSubmit={registrarMovimiento} className="space-y-4">

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Tipo de movimiento
                </label>

                <select
                  value={tipoMovimiento}
                  onChange={(e) =>
                    setTipoMovimiento(
                      e.target.value as "ENTRADA" | "SALIDA"
                    )
                  }
                  className="w-full rounded-lg border border-[#E5E0D8] p-3 outline-none focus:border-[#766B5D]"
                >
                  <option value="ENTRADA">Entrada</option>
                  <option value="SALIDA">Salida</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Cantidad
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E0D8] p-3 outline-none focus:border-[#766B5D]"
                  placeholder="Ejemplo: 5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Observación
                </label>

                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E0D8] p-3 outline-none focus:border-[#766B5D]"
                  placeholder="Describe el movimiento..."
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="w-full rounded-lg bg-[#393632] py-3 font-semibold text-white hover:bg-[#766B5D] disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar movimiento"}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* MODAL DE HISTORIAL */}
      {mostrarHistorial && registroSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#393632]">
                  Historial de movimientos
                </h2>

                <p className="text-sm text-[#77716A]">
                  {obtenerZapatilla(registroSeleccionado.zapatillaId)?.nombre ||
                    `Zapatilla #${registroSeleccionado.zapatillaId}`}
                  {" · "}
                  Talla {registroSeleccionado.talla}
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                className="text-[#77716A] hover:text-[#393632]"
              >
                <X size={22} />
              </button>
            </div>

            {cargandoHistorial ? (
              <p className="py-8 text-center text-[#77716A]">
                Cargando historial...
              </p>
            ) : historial.length === 0 ? (
              <p className="py-8 text-center text-[#77716A]">
                No hay movimientos registrados.
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto">

                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F5F3EF]">
                    <tr>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Cantidad</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Observación</th>
                    </tr>
                  </thead>

                  <tbody>
                    {historial.map((movimiento) => (
                      <tr
                        key={movimiento.id}
                        className="border-t border-[#E5E0D8]"
                      >
                        <td className="p-3 font-medium">
                          {movimiento.tipoMovimiento}
                        </td>

                        <td className="p-3">
                          {movimiento.cantidad}
                        </td>

                        <td className="p-3">
                          {movimiento.fechaMovimiento
                            ? new Date(
                                movimiento.fechaMovimiento
                              ).toLocaleString("es-CL")
                            : "-"}
                        </td>

                        <td className="p-3">
                          {movimiento.observacion || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
