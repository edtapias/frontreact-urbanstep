import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Package,
  Truck,
  CreditCard,
  Ruler,
  Send,
  RefreshCw,
  CheckCircle2,
  Search,
} from "lucide-react";
import { useSoporte } from "../../../hooks/useSoporte";
import {
  SoporteService,
  type ConsultaSoporte,
  type RespuestaSoporte,
} from "../../../services/SoporteService";

const BADGE_ESTADO: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  EN_REVISION: "bg-blue-100 text-blue-800",
  RESPONDIDA: "bg-emerald-100 text-emerald-800",
  CERRADA: "bg-gray-200 text-gray-700",
};

export default function SoportePage() {
  const navigate = useNavigate();

  const {
    form,
    enviando,
    error,
    consultaEnviada,
    actualizarCampo,
    enviarConsulta,
  } = useSoporte();

  const [misTickets, setMisTickets] = useState<ConsultaSoporte[]>([]);
  const [respuestasPorTicket, setRespuestasPorTicket] = useState<
    Record<number, RespuestaSoporte[]>
  >({});
  const [cargandoTickets, setCargandoTickets] = useState(false);

  // Búsqueda manual por # de ticket (útil si el ticket se envió sin clienteId)
  const [ticketBusquedaId, setTicketBusquedaId] = useState("");
  const [ticketBuscado, setTicketBuscado] = useState<ConsultaSoporte | null>(
    null
  );
  const [respuestasTicketBuscado, setRespuestasTicketBuscado] = useState<
    RespuestaSoporte[]
  >([]);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);

  const usuarioActual: { id?: number; nombre?: string; correo?: string } | null =
    (() => {
      try {
        return JSON.parse(localStorage.getItem("usuario") || "null");
      } catch {
        return null;
      }
    })();

  const clienteId = usuarioActual?.id ?? null;

  const cargarMisTickets = async () => {
    if (!clienteId) return;
    setCargandoTickets(true);
    try {
      const tickets = await SoporteService.listarPorCliente(clienteId);
      const ordenados = [...tickets].sort((a, b) => b.id - a.id);
      setMisTickets(ordenados);

      const entradas = await Promise.all(
        ordenados.map(async (t) => {
          try {
            const resps = await SoporteService.listarRespuestas(t.id);
            return [t.id, resps] as const;
          } catch {
            return [t.id, []] as const;
          }
        })
      );
      setRespuestasPorTicket(Object.fromEntries(entradas));
    } catch {
      setMisTickets([]);
    } finally {
      setCargandoTickets(false);
    }
  };

  useEffect(() => {
    cargarMisTickets();
  }, [clienteId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await enviarConsulta();
    await cargarMisTickets();
  };

  const handleBuscarTicketPorId = async (e: React.FormEvent) => {
    e.preventDefault();
    const idNum = Number(ticketBusquedaId.trim());
    if (!idNum || idNum <= 0) return;

    setErrorBusqueda(null);
    setTicketBuscado(null);
    setRespuestasTicketBuscado([]);

    try {
      const resSol = await fetch(`/api/soporte/solicitudes/${idNum}`);
      if (!resSol.ok) {
        throw new Error(`No se encontró el Ticket #${idNum}`);
      }
      const sol: ConsultaSoporte = await resSol.json();
      setTicketBuscado(sol);

      const resps = await SoporteService.listarRespuestas(idNum);
      setRespuestasTicketBuscado(resps);
    } catch (err) {
      setErrorBusqueda(
        err instanceof Error ? err.message : "Error al consultar el ticket"
      );
    }
  };

  const preguntas = [
    {
      icono: Package,
      titulo: "¿Cómo puedo consultar mi pedido?",
      respuesta:
        "Puedes revisar la información de tus compras desde la sección de pedidos de tu cuenta.",
    },
    {
      icono: Ruler,
      titulo: "¿Cómo puedo saber qué talla elegir?",
      respuesta:
        "En cada producto puedes consultar las tallas disponibles antes de agregarlo al carrito.",
    },
    {
      icono: Truck,
      titulo: "¿Cuánto demora el envío?",
      respuesta:
        "El tiempo de entrega depende de la ubicación y las condiciones del despacho.",
    },
    {
      icono: CreditCard,
      titulo: "¿Qué hago si tengo problemas con un pago?",
      respuesta:
        "Si tienes inconvenientes con un pago, puedes enviarnos una consulta mediante el formulario.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F5F3EF] text-[#393632]">
      {/* ENCABEZADO */}
      <section className="bg-[#E5E0D8] px-8 py-16 lg:px-20">
        <button
          onClick={() => navigate("/")}
          className="mb-10 flex items-center gap-2 font-semibold text-[#766B5D] hover:text-[#393632]"
        >
          <ArrowLeft size={18} />
          Volver a la tienda
        </button>

        <div className="mx-auto max-w-4xl text-center">
          <p className="font-bold tracking-[0.3em] text-[#766B5D]">URBANSTEP</p>

          <h1 className="mt-4 text-4xl font-black sm:text-6xl">
            CENTRO DE SOPORTE
          </h1>

          <p className="mx-auto mt-6 max-w-2xl leading-7 text-[#77716A]">
            Estamos aquí para ayudarte. Encuentra respuestas a tus dudas o
            envíanos tu consulta. Queremos que tu experiencia en UrbanStep sea la
            mejor.
          </p>
        </div>
      </section>

      {/* OPCIONES DE AYUDA */}
      <section className="px-8 py-16 lg:px-20">
        <div className="mb-10 text-center">
          <p className="font-bold tracking-widest text-[#766B5D]">
            ¿EN QUÉ PODEMOS AYUDARTE?
          </p>
          <h2 className="mt-3 text-3xl font-black">TEMAS DE AYUDA</h2>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icono: Package,
              titulo: "Pedidos",
              descripcion: "Información sobre tus compras y pedidos.",
            },
            {
              icono: Ruler,
              titulo: "Tallas",
              descripcion:
                "Ayuda para elegir tu talla y consultar disponibilidad.",
            },
            {
              icono: Truck,
              titulo: "Envíos",
              descripcion: "Información sobre entregas y despachos.",
            },
            {
              icono: CreditCard,
              titulo: "Pagos",
              descripcion: "Ayuda con tus pagos y transacciones.",
            },
          ].map((item) => {
            const Icono = item.icono;

            return (
              <div
                key={item.titulo}
                className="rounded-2xl border border-[#E5E0D8] bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAE6DF] text-[#766B5D]">
                  <Icono size={27} />
                </div>

                <h3 className="mt-5 text-lg font-bold">{item.titulo}</h3>

                <p className="mt-3 text-sm leading-6 text-[#77716A]">
                  {item.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section className="bg-white px-8 py-16 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="font-bold tracking-widest text-[#766B5D]">
              RESPUESTAS RÁPIDAS
            </p>

            <h2 className="mt-3 text-3xl font-black">PREGUNTAS FRECUENTES</h2>
          </div>

          <div className="space-y-4">
            {preguntas.map((pregunta) => {
              const Icono = pregunta.icono;

              return (
                <details
                  key={pregunta.titulo}
                  className="group rounded-xl border border-[#E5E0D8] bg-[#F5F3EF] p-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                    <span className="flex items-center gap-3">
                      <Icono size={20} className="shrink-0 text-[#766B5D]" />
                      {pregunta.titulo}
                    </span>

                    <ArrowRight
                      size={18}
                      className="shrink-0 transition group-open:rotate-90"
                    />
                  </summary>

                  <p className="mt-4 pl-8 text-sm leading-7 text-[#77716A]">
                    {pregunta.respuesta}
                  </p>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      {/* FORMULARIO DE CONTACTO */}
      <section className="px-8 py-20 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <MessageCircle size={42} className="text-[#766B5D]" />

            <p className="mt-6 font-bold tracking-widest text-[#766B5D]">
              CONTACTA CON NOSOTROS
            </p>

            <h2 className="mt-3 text-4xl font-black">
              ¿NO ENCONTRASTE LO QUE BUSCABAS?
            </h2>

            <p className="mt-6 leading-8 text-[#77716A]">
              Si todavía tienes dudas o necesitas ayuda con tu compra, completa
              el formulario y cuéntanos qué necesitas.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#E5E0D8] bg-white p-7 shadow-sm sm:p-9"
          >
            <h3 className="mb-7 text-2xl font-black">Envíanos tu consulta</h3>

            <label className="mb-2 block text-sm font-bold">
              Nombre completo
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => actualizarCampo("nombre", e.target.value)}
              placeholder="Ingresa tu nombre"
              className="mb-5 w-full rounded-xl border border-[#E5E0D8] p-3 outline-none focus:border-[#766B5D]"
              required
            />

            <label className="mb-2 block text-sm font-bold">
              Correo electrónico
            </label>
            <input
              type="email"
              value={form.correo}
              onChange={(e) => actualizarCampo("correo", e.target.value)}
              placeholder="ejemplo@correo.com"
              className="mb-5 w-full rounded-xl border border-[#E5E0D8] p-3 outline-none focus:border-[#766B5D]"
              required
            />

            <label className="mb-2 block text-sm font-bold">
              Motivo de consulta
            </label>
            <select
              value={form.motivo}
              onChange={(e) => actualizarCampo("motivo", e.target.value)}
              className="mb-5 w-full rounded-xl border border-[#E5E0D8] bg-white p-3 outline-none focus:border-[#766B5D]"
              required
            >
              <option value="">Selecciona un motivo</option>
              <option value="Pedidos">Problemas con pedidos</option>
              <option value="Tallas">Consultas sobre tallas</option>
              <option value="Pagos">Problemas con pagos</option>
              <option value="Envios">Consultas sobre envíos</option>
              <option value="Cambios">Cambios y devoluciones</option>
              <option value="Otro">Otro motivo</option>
            </select>

            <label className="mb-2 block text-sm font-bold">Mensaje</label>
            <textarea
              value={form.mensaje}
              onChange={(e) => actualizarCampo("mensaje", e.target.value)}
              placeholder="Escribe aquí tu consulta..."
              rows={5}
              className="mb-5 w-full resize-none rounded-xl border border-[#E5E0D8] p-3 outline-none focus:border-[#766B5D]"
              required
            />

            {error && (
              <p className="mb-5 rounded-xl bg-red-100 p-4 text-sm font-semibold text-red-800">
                {error}
              </p>
            )}

            {consultaEnviada && (
              <p className="mb-5 rounded-xl bg-[#EAE6DF] p-4 text-sm font-semibold text-[#5D554B]">
                Consulta enviada correctamente
                {consultaEnviada.id ? ` (Ticket #${consultaEnviada.id})` : ""}.
                Nuestro equipo de soporte la revisará pronto.
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#393632] py-3 font-bold text-white transition hover:bg-[#5D554B] disabled:opacity-50"
            >
              <Send size={18} />
              {enviando ? "Enviando..." : "Enviar consulta"}
            </button>
          </form>
        </div>
      </section>

      {/* SEGUIMIENTO DE CONSULTAS Y RESPUESTAS */}
      <section className="bg-white px-8 py-16 lg:px-20">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold tracking-widest text-[#766B5D]">
                SEGUIMIENTO
              </p>
              <h2 className="mt-1 text-3xl font-black">
                MIS CONSULTAS Y RESPUESTAS
              </h2>
            </div>

            {clienteId && (
              <button
                type="button"
                onClick={cargarMisTickets}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E5E0D8] bg-[#F5F3EF] px-4 py-2 text-sm font-bold hover:bg-[#EAE6DF]"
              >
                <RefreshCw size={15} />
                Actualizar
              </button>
            )}
          </div>

          {/* Lista automática para usuario con sesión iniciada */}
          {clienteId ? (
            cargandoTickets ? (
              <p className="text-sm text-[#77716A]">
                Cargando tus consultas...
              </p>
            ) : misTickets.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E0D8] bg-[#F5F3EF] p-6 text-sm text-[#77716A]">
                No tienes consultas registradas con tu cuenta actual. Si enviaste
                un ticket anteriormente, puedes consultarlo por su número más
                abajo.
              </div>
            ) : (
              <div className="space-y-4">
                {misTickets.map((ticket) => {
                  const resps = respuestasPorTicket[ticket.id] || [];
                  return (
                    <div
                      key={ticket.id}
                      className="space-y-4 rounded-2xl border border-[#E5E0D8] bg-[#F5F3EF] p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black tracking-wider text-[#766B5D]">
                          TICKET #{ticket.id} • {ticket.asunto}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            BADGE_ESTADO[ticket.estado] ||
                            "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {ticket.estado}
                        </span>
                      </div>

                      <p className="whitespace-pre-line text-sm text-[#5D554B]">
                        {ticket.mensaje}
                      </p>

                      {resps.length > 0 ? (
                        <div className="space-y-2 border-t border-[#E5E0D8] pt-4">
                          <p className="flex items-center gap-1.5 text-xs font-black uppercase text-[#766B5D]">
                            <CheckCircle2 size={15} />
                            Respuesta de Soporte UrbanStep
                          </p>
                          {resps.map((r) => (
                            <div
                              key={r.id}
                              className="rounded-xl border border-[#E5E0D8] bg-white p-4 text-sm leading-6 text-[#393632]"
                            >
                              {r.mensaje}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#91897F]">
                          Nuestro equipo aún no ha respondido este ticket.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <p className="text-sm text-[#77716A]">
              Inicia sesión para ver automáticamente el historial de tus
              consultas o busca un ticket por su número:
            </p>
          )}

          {/* Consulta directa por número de ticket */}
          <div className="rounded-2xl border border-[#E5E0D8] bg-[#F5F3EF] p-6">
            <p className="mb-3 text-sm font-bold">
              Consultar ticket por número (ej. #4)
            </p>
            <form
              onSubmit={handleBuscarTicketPorId}
              className="flex flex-wrap gap-3"
            >
              <input
                type="number"
                min={1}
                value={ticketBusquedaId}
                onChange={(e) => setTicketBusquedaId(e.target.value)}
                placeholder="Ingresa el N° de ticket"
                className="w-56 rounded-xl border border-[#E5E0D8] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#766B5D]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#393632] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5D554B]"
              >
                <Search size={16} />
                Consultar
              </button>
            </form>

            {errorBusqueda && (
              <p className="mt-3 text-sm font-semibold text-red-700">
                {errorBusqueda}
              </p>
            )}

            {ticketBuscado && (
              <div className="mt-5 space-y-3 rounded-xl border border-[#E5E0D8] bg-white p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-[#766B5D]">
                    TICKET #{ticketBuscado.id} • {ticketBuscado.asunto}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      BADGE_ESTADO[ticketBuscado.estado] ||
                      "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {ticketBuscado.estado}
                  </span>
                </div>

                <p className="text-sm text-[#5D554B]">{ticketBuscado.mensaje}</p>

                {respuestasTicketBuscado.length > 0 ? (
                  <div className="space-y-2 border-t border-[#E5E0D8] pt-3">
                    <p className="flex items-center gap-1.5 text-xs font-black uppercase text-[#766B5D]">
                      <CheckCircle2 size={15} />
                      Respuesta de Soporte UrbanStep
                    </p>
                    {respuestasTicketBuscado.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-xl bg-[#F5F3EF] p-4 text-sm leading-6 text-[#393632]"
                      >
                        {r.mensaje}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#91897F]">
                    Aún no hay respuestas registradas para este ticket.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* VOLVER A LA TIENDA */}
      <section className="bg-[#E5E0D8] px-8 py-12 text-center">
        <h2 className="text-2xl font-black">GRACIAS POR ELEGIR URBANSTEP.</h2>

        <p className="mt-3 text-[#77716A]">
          Estamos aquí para acompañarte en cada paso.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#393632] px-8 py-3 font-bold text-white hover:bg-[#5D554B]"
        >
          Volver a comprar
          <ArrowRight size={18} />
        </button>
      </section>
    </main>
  );
}