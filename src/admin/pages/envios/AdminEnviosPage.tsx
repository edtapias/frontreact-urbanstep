import { useState } from "react";
import useEnvios from "../../../hooks/useEnvios";

const estados = [
  "PREPARACION",
  "DESPACHADO",
  "EN_TRANSITO",
  "ENTREGADO",
  "FALLIDO",
];

const couriers = [
  "Chilexpress",
  "Starken",
  "Blue Express",
  "Correos de Chile",
];

export default function AdminEnviosPage() {
  const {
    envio,
    cargando,
    error,
    consultarPorPedido,
    asignarTracking,
    actualizarEstado,
    generarEtiqueta,
  } = useEnvios();

  const [pedidoId, setPedidoId] = useState("");
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estado, setEstado] = useState("PREPARACION");
  const [incidencia, setIncidencia] = useState("");

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pedidoId || Number(pedidoId) <= 0) {
      alert("Ingresa un ID de pedido válido.");
      return;
    }

    const resultado = await consultarPorPedido(Number(pedidoId));

    if (resultado) {
      setCourier(resultado.courier || "");
      setTrackingNumber(resultado.trackingNumber || "");
      setEstado(resultado.estado || "PREPARACION");
      setIncidencia(resultado.incidencias || "");
    }
  };

  const guardarTracking = async () => {
    if (!envio) return;

    if (!courier.trim() || !trackingNumber.trim()) {
      alert("Debes ingresar el courier y el número de seguimiento.");
      return;
    }

    if (
      await asignarTracking(envio.id, {
        courier,
        trackingNumber,
      })
    ) {
      alert("Información de seguimiento actualizada.");
    }
  };

  const guardarEstado = async () => {
    if (!envio) return;

    if (
      await actualizarEstado(envio.id, {
        estado,
        incidencia,
      })
    ) {
      alert("Estado del envío actualizado correctamente.");
    }
  };

  const generar = async () => {
    if (!envio) return;

    const resultado = await generarEtiqueta(envio.id);

    if (resultado) {
      alert("Etiqueta generada correctamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de envíos
        </h1>
        <p className="mt-1 text-gray-500">
          Administra los despachos y realiza el seguimiento de los pedidos.
        </p>
      </div>

      {/* BUSCAR */}
      <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Consultar envío
        </h2>

        <form onSubmit={buscar} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="number"
            min="1"
            required
            value={pedidoId}
            onChange={(e) => setPedidoId(e.target.value)}
            placeholder="Ingresa el ID del pedido"
            className="flex-1 rounded-lg border p-3 outline-none focus:border-black"
          />

          <button
            disabled={cargando}
            className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {cargando ? "Buscando..." : "Buscar envío"}
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {envio ? (
        <>
          {/* RESUMEN */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              ["Número de envío", `#${envio.id}`],
              ["Pedido asociado", `#${envio.pedidoId}`],
              ["Estado actual", envio.estado.replaceAll("_", " ")],
            ].map(([titulo, valor]) => (
              <div
                key={titulo}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-gray-500">{titulo}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {valor}
                </p>
              </div>
            ))}
          </div>

          {/* INFORMACIÓN */}
          <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Información del despacho
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[
                ["Método de envío", envio.metodoEnvio],
                [
                  "Costo de envío",
                  `$${Number(envio.costo).toLocaleString("es-CL")}`,
                ],
                ["Región", envio.region || "No especificada"],
                ["Comuna", envio.comuna || "No especificada"],
                [
                  "Dirección completa",
                  envio.direccionCompleta || "No especificada",
                ],
                ["Referencias", envio.referencias || "Sin referencias"],
                [
                  "Última actualización",
                  envio.fechaActualizacion
                    ? new Date(envio.fechaActualizacion).toLocaleString("es-CL")
                    : "No disponible",
                ],
              ].map(([titulo, valor], i) => (
                <div
                  key={titulo}
                  className={i >= 4 ? "md:col-span-2" : ""}
                >
                  <p className="text-sm text-gray-500">{titulo}</p>
                  <p className="mt-1 font-semibold text-gray-900">{valor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* TRACKING */}
          <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Asignar seguimiento
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Courier
                </label>

                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                >
                  <option value="">Seleccionar courier</option>
                  {couriers.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Número de seguimiento
                </label>

                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ej: CH123456789"
                  className="w-full rounded-lg border p-3 outline-none focus:border-black"
                />
              </div>
            </div>

            <button
              onClick={guardarTracking}
              disabled={cargando}
              className="mt-5 rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Guardar seguimiento
            </button>
          </div>

          {/* ESTADO */}
          <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Actualizar estado del envío
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Estado
                </label>

                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                >
                  {estados.map((item) => (
                    <option key={item} value={item}>
                      {item.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Incidencia
                </label>

                <input
                  value={incidencia}
                  onChange={(e) => setIncidencia(e.target.value)}
                  placeholder="Describe alguna incidencia (opcional)"
                  className="w-full rounded-lg border p-3 outline-none focus:border-black"
                />
              </div>
            </div>

            <button
              onClick={guardarEstado}
              disabled={cargando}
              className="mt-5 rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Actualizar estado
            </button>
          </div>

          {/* ETIQUETA */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-bold text-gray-900">
              Etiqueta de despacho
            </h2>

            <p className="mb-5 text-sm text-gray-500">
              Genera la etiqueta logística asociada a este envío.
            </p>

            <button
              onClick={generar}
              disabled={cargando}
              className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Generar etiqueta
            </button>
          </div>
        </>
      ) : (
        !cargando && (
          <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              Ingresa un ID de pedido para consultar su información de envío.
            </p>
          </div>
        )
      )}
    </div>
  );
}
