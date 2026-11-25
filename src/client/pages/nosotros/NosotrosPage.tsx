import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, ShieldCheck, Truck, Sparkles, Award } from "lucide-react";

export default function NosotrosPage() {
  const navigate = useNavigate();

  const valores = [
    {
      icono: Sparkles,
      titulo: "Diseño y Estilo",
      descripcion:
        "Seleccionamos modelos urbanos y deportivos que combinan comodidad diaria con identidad propia.",
    },
    {
      icono: Award,
      titulo: "Calidad Garantizada",
      descripcion:
        "Trabajamos con marcas reconocidas y materiales duraderos pensados para acompañarte en cada paso.",
    },
    {
      icono: Truck,
      titulo: "Envíos a Todo Chile",
      descripcion:
        "Despachamos tus pedidos de forma segura y con seguimiento directo hasta la puerta de tu casa.",
    },
    {
      icono: ShieldCheck,
      titulo: "Compra Protegida",
      descripcion:
        "Procesos transparentes, cambios fáciles y un equipo de soporte listo para ayudarte.",
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
            SOBRE NOSOTROS
          </h1>

          <p className="mx-auto mt-6 max-w-2xl leading-7 text-[#77716A]">
            Nacimos con una idea simple: acercar las mejores zapatillas a
            quienes buscan comodidad, autenticidad y estilo en su día a día.
          </p>
        </div>
      </section>

      {/* HISTORIA / MISIÓN */}
      <section className="px-8 py-16 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <p className="font-bold tracking-widest text-[#766B5D]">
              NUESTRA ESENCIA
            </p>
            <h2 className="text-3xl font-black sm:text-4xl">
              CAMINA A TU PROPIO RITMO
            </h2>
            <p className="leading-8 text-[#5D554B]">
              En UrbanStep creemos que cada par de zapatillas cuenta una
              historia. Por eso reunimos modelos seleccionados para entrenar,
              recorrer la ciudad o destacar con un look urbano sin sacrificar
              comodidad.
            </p>
            <p className="leading-8 text-[#5D554B]">
              Nuestro compromiso es ofrecer una experiencia de compra clara,
              rápida y cercana, con atención personalizada ante cualquier duda
              sobre tallas, envíos o pedidos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-black text-[#393632]">100%</p>
              <p className="mt-2 text-xs font-bold tracking-wider text-[#766B5D]">
                PRODUCTOS ORIGINALES
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-black text-[#393632]">24/7</p>
              <p className="mt-2 text-xs font-bold tracking-wider text-[#766B5D]">
                TIENDA EN LÍNEA
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-black text-[#393632]">CHILE</p>
              <p className="mt-2 text-xs font-bold tracking-wider text-[#766B5D]">
                COBERTURA NACIONAL
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-black text-[#393632]">SOPORTE</p>
              <p className="mt-2 text-xs font-bold tracking-wider text-[#766B5D]">
                ATENCIÓN DIRECTA
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="bg-white px-8 py-16 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="font-bold tracking-widest text-[#766B5D]">
              LO QUE NOS DEFINE
            </p>
            <h2 className="mt-3 text-3xl font-black">NUESTROS PILARES</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {valores.map((item) => {
              const Icono = item.icono;
              return (
                <div
                  key={item.titulo}
                  className="rounded-2xl border border-[#E5E0D8] bg-[#F5F3EF] p-7 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#766B5D] shadow-sm">
                    <Icono size={26} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{item.titulo}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#77716A]">
                    {item.descripcion}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[#E5E0D8] px-8 py-14 text-center">
        <h2 className="text-2xl font-black">DESCUBRE TU PRÓXIMO PAR</h2>
        <p className="mt-3 text-[#77716A]">
          Explora nuestra colección completa o escríbenos si necesitas ayuda.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate("/catalogo")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#393632] px-8 py-3 font-bold text-white hover:bg-[#5D554B]"
          >
            Ver catálogo
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => navigate("/soporte")}
            className="rounded-xl border border-[#393632] px-8 py-3 font-bold text-[#393632] hover:bg-white"
          >
            Ir a soporte
          </button>
        </div>
      </section>
    </main>
  );
}