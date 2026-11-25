import { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  Tag,
} from "lucide-react";
import {
  SoporteService,
  type ConsultaSoporte,
  type RespuestaSoporte,
} from "../../../services/SoporteService"

const ESTADOS = ["PENDIENTE", "EN_REVISION", "RESPONDIDA", "CERRADA"] as const;
const CATEGORIAS = [
  "Pedidos",
  "Tallas",
  "Pagos",
  "Envios",
  "Cambios",
  "General",
  "Otro",
];

const BADGE_ESTADO: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  EN_REVISION: "bg-blue-100 text-blue-800",
  RESPONDIDA: "bg-emerald-100 text-emerald-800",
  CERRADA: "bg-gray-200 text-gray-700",
};

export default function AdminSoportePage() {
  const [solicitudes, setSolicitudes] = useState<ConsultaSoporte[]>([]);
  const [seleccionada, setSeleccionada] = useState<ConsultaSoporte | null>(
    null
  );
  const [respuestas, setRespuestas] = useState<RespuestaSoporte[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const adminId: number | null = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("usuario") || "null");
      return u?.id ?? null;
    } catch {
      return null;
    }
  })();

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError(null);
    try {
      const lista = await SoporteService.listarTodas();
      const ordenadas = [...lista].sort((a, b) => b.id - a.id);
      setSolicitudes(ordenadas);

      if (seleccionada) {
        const actualizada =
          ordenadas.find((s) => s.id === seleccionada.id) ?? null;
        setSeleccionada(actualizada);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar solicitudes"
      );
    } finally {
      setCargando(false);
    }
  };

  const cargarRespuestas = async (solicitudId: number) => {
    try {
      const lista = await SoporteService.listarRespuestas(solicitudId);
      setRespuestas(lista);
    } catch {
      setRespuestas([]);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  useEffect(() => {
    if (seleccionada) {
      cargarRespuestas(seleccionada.id);
      setNuevaRespuesta("");
      setAviso(null);
    } else {
      setRespuestas([]);
    }
  }, [seleccionada?.id]);

  const handleResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seleccionada || !nuevaRespuesta.trim()) return;

    setEnviando(true);
    setError(null);
    setAviso(null);

    try {
      await SoporteService.responder(
        seleccionada.id,
        nuevaRespuesta,
        adminId
      );
      setNuevaRespuesta("");
      setAviso("Respuesta enviada al cliente.");
      await cargarRespuestas(seleccionada.id);
      await cargarSolicitudes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al responder");
    } finally {
      setEnviando(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!seleccionada) return;
    setError(null);
    setAviso(null);
    try {
      const actualizada = await SoporteService.actualizarEstado(
        seleccionada.id,
        nuevoEstado
      );
      setSeleccionada(actualizada);
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === actualizada.id ? actualizada : s))
      );
      setAviso(`Estado actualizado a ${nuevoEstado}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar el estado"
      );
    }
  };

  const handleCambiarCategoria = async (nuevaCategoria: string) => {
    if (!seleccionada) return;
    setError(null);
    setAviso(null);
    try {
      const actualizada = await SoporteService.actualizarCategoria(
        seleccionada.id,
        nuevaCategoria
      );
      setSeleccionada(actualizada);
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === actualizada.id ? actualizada : s))
      );
      setAviso(`Categoría actualizada a ${nuevaCategoria}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar la categoría"
      );
    }
  };

  const solicitudesFiltradas =
    filtroEstado === "TODOS"
      ? solicitudes
      : solicitudes.filter((s) => s.estado === filtroEstado);

  return (
    <main className="min-h-screen bg-[#F5F3EF] p-6 text-[#393632] lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Encabezado */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-[#766B5D]">
              ADMINISTRACIÓN
            </p>
            <h1 className="mt-1 text-3xl font-black">
              GESTIÓN DE SOPORTE ({solicitudes.length})
            </h1>
          </div>

          <button
            type="button"
            onClick={cargarSolicitudes}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E5E0D8] bg-white px-4 py-2.5 text-sm font-bold hover:bg-[#EAE6DF]"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>

        {/* Filtros por estado */}
        <div className="flex flex-wrap gap-2">
          {["TODOS", ...ESTADOS].map((estado) => (
            <button
              key={estado}
              type="button"
              onClick={() => setFiltroEstado(estado)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filtroEstado === estado
                  ? "bg-[#393632] text-white"
                  : "border border-[#E5E0D8] bg-white text-[#5D554B] hover:bg-[#EAE6DF]"
              }`}
            >
              {estado}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl bg-red-100 p-4 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        {aviso && (
          <div className="rounded-xl bg-emerald-100 p-4 text-sm font-semibold text-emerald-800">
            {aviso}
          </div>
        )}

        {/* Grilla maestro-detalle */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Lista de tickets */}
          <div className="space-y-3 lg:col-span-5">
            {cargando ? (
              <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 text-sm text-[#77716A]">
                Cargando solicitudes...
              </div>
            ) : solicitudesFiltradas.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 text-sm text-[#77716A]">
                No hay solicitudes para mostrar.
              </div>
            ) : (
              solicitudesFiltradas.map((sol) => {
                const activa = seleccionada?.id === sol.id;
                return (
                  <button
                    key={sol.id}
                    type="button"
                    onClick={() => setSeleccionada(sol)}
                    className={`w-full rounded-2xl border p-5 text-left transition ${
                      activa
                        ? "border-[#393632] bg-white shadow-md"
                        : "border-[#E5E0D8] bg-white hover:border-[#766B5D]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-[#766B5D]">
                        TICKET #{sol.id}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          BADGE_ESTADO[sol.estado] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {sol.estado}
                      </span>
                    </div>

                    <p className="mt-2 font-bold">{sol.asunto}</p>
                    <p className="text-xs text-[#77716A]">
                      {sol.nombre} • {sol.correo}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-[#5D554B]">
                      {sol.mensaje}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Detalle y respuesta */}
          <div className="lg:col-span-7">
            {!seleccionada ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E5E0D8] bg-white p-8 text-center text-[#77716A]">
                <MessageSquare size={36} className="mb-3 text-[#766B5D]" />
                <p className="font-bold text-[#393632]">
                  Selecciona un ticket para ver el detalle
                </p>
                <p className="mt-1 text-sm">
                  Podrás cambiar su estado, categorizarlo y responder al
                  cliente.
                </p>
              </div>
            ) : (
              <div className="space-y-6 rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm sm:p-8">
                {/* Cabecera del ticket */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E0D8] pb-5">
                  <div>
                    <span className="text-xs font-black tracking-wider text-[#766B5D]">
                      TICKET #{seleccionada.id}
                    </span>
                    <h2 className="mt-1 text-2xl font-black">
                      {seleccionada.asunto}
                    </h2>
                    <p className="mt-1 text-sm text-[#77716A]">
                      De <span className="font-semibold">{seleccionada.nombre}</span>{" "}
                      ({seleccionada.correo})
                    </p>
                  </div>

                  {/* Controles rápidos de estado y categoría */}
                  <div className="flex flex-wrap gap-3">
                    <div>
                      <label className="mb-1 flex items-center gap-1 text-xs font-bold text-[#766B5D]">
                        <Clock size={13} /> Estado
                      </label>
                      <select
                        value={seleccionada.estado}
                        onChange={(e) => handleCambiarEstado(e.target.value)}
                        className="rounded-xl border border-[#E5E0D8] bg-[#F5F3EF] px-3 py-2 text-xs font-bold outline-none"
                      >
                        {ESTADOS.map((est) => (
                          <option key={est} value={est}>
                            {est}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 flex items-center gap-1 text-xs font-bold text-[#766B5D]">
                        <Tag size={13} /> Categoría
                      </label>
                      <select
                        value={seleccionada.categoria || "General"}
                        onChange={(e) =>
                          handleCambiarCategoria(e.target.value)
                        }
                        className="rounded-xl border border-[#E5E0D8] bg-[#F5F3EF] px-3 py-2 text-xs font-bold outline-none"
                      >
                        {CATEGORIAS.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mensaje original */}
                <div className="rounded-xl bg-[#F5F3EF] p-4">
                  <p className="mb-1 text-xs font-bold uppercase text-[#766B5D]">
                    Consulta del cliente
                  </p>
                  <p className="whitespace-pre-line text-sm leading-6">
                    {seleccionada.mensaje}
                  </p>
                </div>

                {/* Historial de respuestas */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#766B5D]">
                    <CheckCircle2 size={16} />
                    Respuestas enviadas ({respuestas.length})
                  </h3>

                  {respuestas.length === 0 ? (
                    <p className="text-sm text-[#77716A]">
                      Aún no hay respuestas registradas para este ticket.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {respuestas.map((resp) => (
                        <div
                          key={resp.id}
                          className="rounded-xl border border-[#E5E0D8] bg-[#EAE6DF]/60 p-4"
                        >
                          <p className="whitespace-pre-line text-sm">
                            {resp.mensaje}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formulario para responder */}
                {seleccionada.estado === "CERRADA" ? (
                  <p className="rounded-xl bg-gray-100 p-4 text-sm font-semibold text-gray-600">
                    Esta solicitud está cerrada. Cambia su estado si necesitas
                    agregar una nueva respuesta.
                  </p>
                ) : (
                  <form onSubmit={handleResponder} className="space-y-3 pt-2">
                    <label className="block text-sm font-bold">
                      Responder al cliente
                    </label>
                    <textarea
                      rows={4}
                      value={nuevaRespuesta}
                      onChange={(e) => setNuevaRespuesta(e.target.value)}
                      placeholder="Escribe la respuesta oficial de soporte..."
                      required
                      className="w-full resize-none rounded-xl border border-[#E5E0D8] p-3 text-sm outline-none focus:border-[#766B5D]"
                    />
                    <button
                      type="submit"
                      disabled={enviando}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#393632] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#5D554B] disabled:opacity-50"
                    >
                      <Send size={16} />
                      {enviando ? "Enviando..." : "Enviar respuesta"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}