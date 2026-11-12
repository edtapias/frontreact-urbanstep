
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Package,
  Truck,
  CreditCard,
  Ruler,
  Send
} from "lucide-react";

export default function SoportePage() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [confirmacion, setConfirmacion] = useState("");

  const preguntas = [
    {
      icono: Package,
      titulo: "¿Cómo puedo consultar mi pedido?",
      respuesta:
        "Puedes revisar la información de tus compras desde la sección de pedidos de tu cuenta."
    },
    {
      icono: Ruler,
      titulo: "¿Cómo puedo saber qué talla elegir?",
      respuesta:
        "En cada producto puedes consultar las tallas disponibles antes de agregarlo al carrito."
    },
    {
      icono: Truck,
      titulo: "¿Cuánto demora el envío?",
      respuesta:
        "El tiempo de entrega depende de la ubicación y las condiciones del despacho."
    },
    {
      icono: CreditCard,
      titulo: "¿Qué hago si tengo problemas con un pago?",
      respuesta:
        "Si tienes inconvenientes con un pago, puedes enviarnos una consulta mediante el formulario."
    }
  ];

  const enviarConsulta = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nombre.trim() || !correo.trim() || !asunto || !mensaje.trim()) {
      setConfirmacion("Completa todos los campos antes de enviar.");
      return;
    }

    setConfirmacion(
      "Tu consulta fue registrada en este formulario. Para enviarla al equipo de soporte, es necesario conectar el formulario con el servicio backend."
    );

    setNombre("");
    setCorreo("");
    setAsunto("");
    setMensaje("");
  };

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
          <p className="font-bold tracking-[0.3em] text-[#766B5D]">
            URBANSTEP
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-6xl">
            CENTRO DE SOPORTE
          </h1>

          <p className="mx-auto mt-6 max-w-2xl leading-7 text-[#77716A]">
            Estamos aquí para ayudarte. Encuentra respuestas a tus dudas
            o envíanos tu consulta. Queremos que tu experiencia en UrbanStep
            sea la mejor.
          </p>
        </div>
      </section>

      {/* OPCIONES DE AYUDA */}
      <section className="px-8 py-16 lg:px-20">
        <div className="mb-10 text-center">
          <p className="font-bold tracking-widest text-[#766B5D]">
            ¿EN QUÉ PODEMOS AYUDARTE?
          </p>
          <h2 className="mt-3 text-3xl font-black">
            TEMAS DE AYUDA
          </h2>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icono: Package,
              titulo: "Pedidos",
              descripcion: "Información sobre tus compras y pedidos."
            },
            {
              icono: Ruler,
              titulo: "Tallas",
              descripcion: "Ayuda para elegir tu talla y consultar disponibilidad."
            },
            {
              icono: Truck,
              titulo: "Envíos",
              descripcion: "Información sobre entregas y despachos."
            },
            {
              icono: CreditCard,
              titulo: "Pagos",
              descripcion: "Ayuda con tus pagos y transacciones."
            }
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

                <h3 className="mt-5 text-lg font-bold">
                  {item.titulo}
                </h3>

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

            <h2 className="mt-3 text-3xl font-black">
              PREGUNTAS FRECUENTES
            </h2>
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
              Si todavía tienes dudas o necesitas ayuda con tu compra,
              completa el formulario y cuéntanos qué necesitas.
            </p>
          </div>

          <form
            onSubmit={enviarConsulta}
            className="rounded-2xl border border-[#E5E0D8] bg-white p-7 shadow-sm sm:p-9"
          >
            <h3 className="mb-7 text-2xl font-black">
              Envíanos tu consulta
            </h3>

            <label className="mb-2 block text-sm font-bold">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingresa tu nombre"
              className="mb-5 w-full rounded-xl border border-[#E5E0D8] p-3 outline-none focus:border-[#766B5D]"
              required
            />

            <label className="mb-2 block text-sm font-bold">
              Correo electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="mb-5 w-full rounded-xl border border-[#E5E0D8] p-3 outline-none focus:border-[#766B5D]"
              required
            />

            <label className="mb-2 block text-sm font-bold">
              Motivo de consulta
            </label>
            <select
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
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

            <label className="mb-2 block text-sm font-bold">
              Mensaje
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe aquí tu consulta..."
              rows={5}
              className="mb-5 w-full resize-none rounded-xl border border-[#E5E0D8] p-3 outline-none focus:border-[#766B5D]"
              required
            />

            {confirmacion && (
              <p className="mb-5 rounded-xl bg-[#EAE6DF] p-4 text-sm font-semibold text-[#5D554B]">
                {confirmacion}
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#393632] py-3 font-bold text-white transition hover:bg-[#5D554B]"
            >
              <Send size={18} />
              Enviar consulta
            </button>
          </form>
        </div>
      </section>

      {/* VOLVER A LA TIENDA */}
      <section className="bg-[#E5E0D8] px-8 py-12 text-center">
        <h2 className="text-2xl font-black">
          GRACIAS POR ELEGIR URBANSTEP.
        </h2>

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
