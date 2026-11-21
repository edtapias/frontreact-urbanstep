
import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Heart, ShoppingBag, ArrowRight, X, Plus, Minus } from "lucide-react";

import { useProductos } from "../../../hooks/useProductos";
import { useFavoritos } from "../../../hooks/useFavoritos";
import InventarioService, { type Inventario } from "../../../services/InventarioService";
import CarritoService from "../../../services/CarritoService";
import ResenasSection from "../../../client/resenas/ResenasSection";

export default function HomePage() {
  const { productos, cargando, error } = useProductos();
  const { favoritos, toggleFavorito } = useFavoritos();
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [cargandoTallas, setCargandoTallas] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [errorCarrito, setErrorCarrito] = useState("");
  const [zapatillaResenas, setZapatillaResenas] = useState<any>(null);

  // Productos destacados
  const productosDestacados = productos.filter(p => p.destacado === true);

  const categorias = [
    "Todos",
    ...Array.from(new Set(
      productosDestacados.map(p => p.categoria?.nombre).filter(Boolean)
    ))
  ];

  // Búsqueda y categorías
  const filtrados = productosDestacados.filter(p => {
    const texto = busqueda.toLowerCase();
    return (
      (p.nombre.toLowerCase().includes(texto) ||
        p.marca.toLowerCase().includes(texto)) &&
      (categoria === "Todos" || p.categoria?.nombre === categoria)
    );
  });

  const precio = (valor: number) =>
    valor.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0
    });

  const obtenerRutaImagen = (p: any) => {
    const url = p.imagenUrl || p.imagen || p.urlImagen;
    return !url || url.includes("ejemplo.com")
      ? "/imagenes/ultraboost.jpg"
      : url;
  };

  const manejarFavorito = async (id: number) => {
    const resultado = await toggleFavorito(id);
    if (resultado.requiereLogin) navigate("/login");
  };

  // Consultar tallas
  const abrirSelector = async (producto: any) => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    if (!usuario?.id) return navigate("/login");

    setProductoSeleccionado(producto);
    setInventarios([]);
    setTallaSeleccionada("");
    setCantidad(1);
    setErrorCarrito("");
    setCargandoTallas(true);

    try {
      const datos = await InventarioService.consultarPorZapatilla(producto.id);
      const disponibles = datos.filter(item => item.cantidadDisponible > 0);
      setInventarios(disponibles);

      if (!disponibles.length) {
        setErrorCarrito("Este producto no tiene tallas disponibles.");
      }
    } catch (err) {
      console.error(err);
      setErrorCarrito("No fue posible consultar el inventario.");
    } finally {
      setCargandoTallas(false);
    }
  };

  const inventarioSeleccionado = inventarios.find(
    item => item.talla === tallaSeleccionada
  );

  // Agregar al carrito
  const agregarAlCarrito = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

    if (!usuario?.id) return navigate("/login");

    if (!productoSeleccionado || !tallaSeleccionada) {
      setErrorCarrito("Selecciona una talla.");
      return;
    }

    if (
      !inventarioSeleccionado ||
      cantidad < 1 ||
      cantidad > inventarioSeleccionado.cantidadDisponible
    ) {
      setErrorCarrito("La cantidad supera el stock disponible.");
      return;
    }

    setAgregando(true);
    setErrorCarrito("");

    try {
      await CarritoService.agregar(usuario.id, {
        productoId: productoSeleccionado.id,
        talla: tallaSeleccionada,
        cantidad
      });

      setProductoSeleccionado(null);
      setTallaSeleccionada("");
      setCantidad(1);
      navigate("/carrito");
    } catch (err: any) {
      const respuesta = err.response?.data;
      setErrorCarrito(
        typeof respuesta === "string"
          ? respuesta
          : respuesta?.message || respuesta?.mensaje ||
            "No se pudo agregar el producto al carrito."
      );
    } finally {
      setAgregando(false);
    }
  };

  return (
    <main className="w-full bg-[#F5F3EF] text-[#393632]">

      {/* PORTADA */}
      <section className="relative flex min-h-[600px] items-center overflow-hidden bg-[#E5E0D8]">
        <img
          src="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1800"
          alt="Colección UrbanStep"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5F3EF] via-[#F5F3EF]/80 to-transparent" />

        <div className="relative w-full px-8 py-24 lg:px-20">
          <span className="rounded-full bg-[#EAE6DF] px-4 py-2 text-sm font-bold text-[#766B5D]">
            NUEVA COLECCIÓN 2026
          </span>
          <h1 className="mt-8 text-5xl font-black sm:text-7xl">
            CAMINA A TU<br />
            <span className="text-[#766B5D]">PROPIO RITMO.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[#77716A]">
            Encuentra las zapatillas que representan tu estilo.
            Comodidad, diseño y personalidad en cada paso.
          </p>
          <a href="#catalogo" className="mt-8 inline-flex items-center rounded-xl bg-[#393632] px-8 py-3 font-bold text-white hover:bg-[#5D554B]">
            Explorar colección <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="grid gap-6 bg-[#E5E0D8] px-8 py-10 md:grid-cols-3 lg:px-20">
        {[
          ["🚚", "Envíos a todo Chile", "Recibe tus compras en casa"],
          ["🛡️", "Compra segura", "Compras protegidas"],
          ["↻", "Cambios fáciles", "Tu comodidad es importante"]
        ].map(([icono, titulo, descripcion]) => (
          <div key={titulo} className="flex items-center gap-4">
            <span className="text-3xl">{icono}</span>
            <div>
              <h3 className="font-bold">{titulo}</h3>
              <p className="text-sm text-[#77716A]">{descripcion}</p>
            </div>
          </div>
        ))}
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section id="catalogo" className="w-full px-8 py-20 lg:px-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-bold tracking-widest text-[#766B5D]">ENCUENTRA TU ESTILO</p>
            <h2 className="mt-3 text-4xl font-black">NUESTROS PRODUCTOS.</h2>
            <p className="mt-3 text-[#77716A]">
              Descubre nuestra selección de zapatillas destacadas.
            </p>
          </div>

          <div className="relative md:w-80">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#91897F]" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar zapatillas..."
              className="h-12 w-full rounded-xl border border-[#E5E0D8] bg-white pl-12 pr-4 outline-none focus:border-[#766B5D]"
            />
          </div>
        </div>

        {/* CATEGORÍAS */}
        <div className="my-8 flex flex-wrap gap-3">
          {categorias.map(opcion => (
            <button
              key={opcion}
              onClick={() => setCategoria(opcion)}
              className={`rounded-full px-6 py-2 font-bold ${
                categoria === opcion
                  ? "bg-[#393632] text-white"
                  : "bg-[#EAE6DF] text-[#5D554B] hover:bg-[#D8D1C7]"
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>

        {cargando && <p className="py-16 text-center text-[#77716A]">Cargando productos...</p>}

        {!cargando && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
            <p className="font-semibold">{error}</p>
            <p className="mt-2 text-sm">Comprueba que el microservicio de catálogo esté encendido.</p>
          </div>
        )}

        {!cargando && !error && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filtrados.map(p => (
                <article key={p.id} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E0D8] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative aspect-square overflow-hidden bg-[#EAE6DF]">
                    <img
                      src={obtenerRutaImagen(p)}
                      alt={p.nombre}
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/imagenes/ultraboost.jpg";
                      }}
                      className="h-full w-full object-contain p-4 transition duration-500 hover:scale-110"
                    />

                    <button
                      onClick={() => manejarFavorito(p.id)}
                      aria-label="Agregar o quitar favorito"
                      className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-md"
                    >
                      <Heart className={favoritos.includes(p.id) ? "fill-red-400 text-red-400" : "text-[#554F48]"} />
                    </button>

                    {p.categoria?.nombre && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#554F48]">
                        {p.categoria.nombre}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#766B5D]">{p.marca}</p>
                      <h3 className="mt-2 text-lg font-bold">{p.nombre}</h3>
                      {p.color && <p className="mt-2 text-sm text-[#77716A]">Color: {p.color}</p>}
                    </div>

                    <div>
                      <p className="mt-3 text-xl font-black">{precio(p.precio)}</p>
                      <p className="mt-2 text-xs font-semibold text-[#65816C]">Consulta las tallas disponibles</p>

                      <button
                        onClick={() => abrirSelector(p)}
                        className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#EAE6DF] py-3 font-bold hover:bg-[#D8D1C7]"
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" /> Agregar al carrito
                      </button>

                      <button
                        onClick={() => setZapatillaResenas(p)}
                        className="mt-2 w-full rounded-xl border border-[#766B5D] py-3 font-bold text-[#766B5D] hover:bg-[#EAE6DF]"
                      >
                        Ver reseñas
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filtrados.length === 0 && (
              <p className="py-12 text-center text-[#77716A]">
                {productosDestacados.length === 0
                  ? "Todavía no hay zapatillas destacadas."
                  : "No encontramos productos."}
              </p>
            )}
          </>
        )}
      </section>

      {/* BANNER */}
      <section className="bg-[#E5E0D8] px-8 py-16 lg:px-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-bold tracking-widest text-[#766B5D]">URBANSTEP</p>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">
              TU PRÓXIMO PASO COMIENZA AQUÍ.
            </h2>
          </div>
          <a href="#catalogo" className="rounded-xl bg-[#393632] px-8 py-3 text-center font-bold text-white hover:bg-[#5D554B]">
            Ver colección
          </a>
        </div>
      </section>

      {/* SOPORTE */}
      <section
        id="soporte"
        className="bg-[#E5E0D8] px-8 py-20 lg:px-20"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-bold tracking-widest text-[#766B5D]">
            ESTAMOS PARA AYUDARTE
          </p>

          <h2 className="mt-4 text-4xl font-black">
            ¿NECESITAS AYUDA?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#77716A]">
            En UrbanStep queremos que tengas la mejor experiencia.
            Si tienes dudas sobre tus pedidos, tallas, pagos o envíos,
            nuestro equipo de soporte está disponible para ayudarte.
          </p>

          <div className="mt-10 grid gap-5 text-left sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-bold">Pedidos</h3>
              <p className="mt-2 text-sm text-[#77716A]">
                Consulta información sobre tus compras y pedidos.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-bold">Tallas y productos</h3>
              <p className="mt-2 text-sm text-[#77716A]">
                Resuelve tus dudas sobre disponibilidad y tallas.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-bold">Envíos y cambios</h3>
              <p className="mt-2 text-sm text-[#77716A]">
                Obtén ayuda con entregas y cambios de productos.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/soporte")}
            className="mt-9 rounded-xl bg-[#393632] px-8 py-3 font-bold text-white hover:bg-[#5D554B]"
          >
            Ir a soporte
            <ArrowRight className="ml-2 inline h-4 w-4" />
          </button>
        </div>
      </section>

      {/* MODAL DE TALLAS Y CANTIDAD */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button onClick={() => setProductoSeleccionado(null)} className="absolute right-4 top-4 rounded-full p-2 hover:bg-[#EAE6DF]">
              <X />
            </button>

            <p className="text-sm font-bold tracking-widest text-[#766B5D]">URBANSTEP</p>
            <h2 className="mt-2 pr-8 text-2xl font-black">{productoSeleccionado.nombre}</h2>
            <p className="mt-2 font-bold">{precio(productoSeleccionado.precio)}</p>

            {cargandoTallas ? (
              <p className="py-10 text-center text-[#77716A]">Consultando tallas disponibles...</p>
            ) : (
              <>
                <label className="mb-2 mt-6 block text-sm font-bold">Selecciona una talla</label>
                <select
                  value={tallaSeleccionada}
                  onChange={e => {
                    setTallaSeleccionada(e.target.value);
                    setCantidad(1);
                    setErrorCarrito("");
                  }}
                  className="w-full rounded-xl border border-[#E5E0D8] bg-white p-3 outline-none focus:border-[#766B5D]"
                >
                  <option value="">Seleccionar talla</option>
                  {inventarios.map(item => (
                    <option key={item.id} value={item.talla}>
                      Talla {item.talla} — Stock: {item.cantidadDisponible}
                    </option>
                  ))}
                </select>

                {inventarioSeleccionado && (
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-bold">Cantidad</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setCantidad(n => Math.max(1, n - 1))}
                        disabled={cantidad <= 1}
                        className="rounded-lg bg-[#EAE6DF] p-2 disabled:opacity-40"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="min-w-8 text-center text-lg font-bold">{cantidad}</span>
                      <button
                        onClick={() => setCantidad(n => Math.min(inventarioSeleccionado.cantidadDisponible, n + 1))}
                        disabled={cantidad >= inventarioSeleccionado.cantidadDisponible}
                        className="rounded-lg bg-[#EAE6DF] p-2 disabled:opacity-40"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-[#77716A]">
                      Stock disponible: {inventarioSeleccionado.cantidadDisponible}
                    </p>
                  </div>
                )}
              </>
            )}

            {errorCarrito && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{errorCarrito}</p>}

            <button
              onClick={agregarAlCarrito}
              disabled={cargandoTallas || agregando || inventarios.length === 0 || !tallaSeleccionada}
              className="mt-6 w-full rounded-xl bg-[#393632] py-3 font-bold text-white hover:bg-[#5D554B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {agregando ? "Agregando..." : "Confirmar y agregar al carrito"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE RESEÑAS */}
      {zapatillaResenas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <button onClick={() => setZapatillaResenas(null)} className="absolute right-4 top-4 rounded-full p-2 hover:bg-[#EAE6DF]">
              <X />
            </button>
            <p className="text-sm font-bold tracking-widest text-[#766B5D]">URBANSTEP</p>
            <h2 className="mt-2 pr-10 text-2xl font-black">
              Reseñas de {zapatillaResenas.nombre}
            </h2>
            <ResenasSection zapatillaId={Number(zapatillaResenas.id)} />
          </div>
        </div>
      )}
    </main>
  );
}
