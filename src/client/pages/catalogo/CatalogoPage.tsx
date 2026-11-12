
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Heart,
  ShoppingBag,
  X,
  Plus,
  Minus,
} from "lucide-react";

import { useProductos } from "../../../hooks/useProductos";
import { useFavoritos } from "../../../hooks/useFavoritos";
import InventarioService, {
  type Inventario,
} from "../../../services/InventarioService";
import CarritoService from "../../../services/CarritoService";
import ResenasSection from "../../resenas/ResenasSection";

export default function CatalogoPage() {
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

  const categorias = [
    "Todos",
    ...Array.from(
      new Set(
        productos
          .map((p) => p.categoria?.nombre)
          .filter((nombre): nombre is string => Boolean(nombre))
      )
    ),
  ];

  const filtrados = productos.filter((p) => {
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      p.nombre.toLowerCase().includes(texto) ||
      p.marca.toLowerCase().includes(texto);

    const coincideCategoria =
      categoria === "Todos" || p.categoria?.nombre === categoria;

    return coincideBusqueda && coincideCategoria;
  });

  const precio = (valor: number) =>
    valor.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });

  const obtenerRutaImagen = (p: any) => {
    const url = p.imagenUrl || p.imagen || p.urlImagen;

    return !url || url.includes("ejemplo.com")
      ? "/imagenes/ultraboost.jpg"
      : url;
  };

  const manejarFavorito = async (productoId: number) => {
    const resultado = await toggleFavorito(productoId);

    if (resultado.requiereLogin) {
      navigate("/login");
    }
  };

  const abrirSelector = async (producto: any) => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

    if (!usuario?.id) {
      navigate("/login");
      return;
    }

    setProductoSeleccionado(producto);
    setInventarios([]);
    setTallaSeleccionada("");
    setCantidad(1);
    setErrorCarrito("");
    setCargandoTallas(true);

    try {
      const datos = await InventarioService.consultarPorZapatilla(producto.id);
      const disponibles = datos.filter(
        (item) => item.cantidadDisponible > 0
      );

      setInventarios(disponibles);

      if (disponibles.length === 0) {
        setErrorCarrito("Este producto no tiene tallas disponibles.");
      }
    } catch (error) {
      console.error("Error al consultar tallas:", error);
      setErrorCarrito(
        "No fue posible consultar el inventario. Comprueba que el servicio esté encendido."
      );
    } finally {
      setCargandoTallas(false);
    }
  };

  const inventarioSeleccionado = inventarios.find(
    (item) => item.talla === tallaSeleccionada
  );

  const agregarAlCarrito = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

    if (!usuario?.id) {
      navigate("/login");
      return;
    }

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
        cantidad,
      });

      setProductoSeleccionado(null);
      setTallaSeleccionada("");
      setCantidad(1);

      navigate("/carrito");
    } catch (error: any) {
      console.error("Error al agregar al carrito:", error);

      const respuesta = error.response?.data;

      setErrorCarrito(
        typeof respuesta === "string"
          ? respuesta
          : respuesta?.message ||
            respuesta?.mensaje ||
            "No se pudo agregar el producto. Comprueba el stock y los servicios."
      );
    } finally {
      setAgregando(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#F5F3EF] px-8 py-16 text-[#393632] lg:px-20">
      {/* ENCABEZADO */}
      <div className="mb-10">
        <p className="font-bold tracking-widest text-[#766B5D]">
          URBANSTEP
        </p>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          TODAS LAS ZAPATILLAS.
        </h1>

        <p className="mt-4 text-[#77716A]">
          Explora nuestra colección completa y encuentra tu próximo estilo.
        </p>
      </div>

      {/* BÚSQUEDA */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#91897F]" />

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar zapatillas..."
          className="h-12 w-full rounded-xl border border-[#E5E0D8] bg-white pl-12 pr-4 outline-none focus:border-[#766B5D]"
        />
      </div>

      {/* CATEGORÍAS */}
      <div className="mb-10 flex flex-wrap gap-3">
        {categorias.map((opcion) => (
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

      {/* RESULTADOS */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Nuestra colección</h2>
        <p className="text-sm text-[#77716A]">
          {filtrados.length} productos
        </p>
      </div>

      {cargando && (
        <p className="py-16 text-center text-[#77716A]">
          Cargando productos...
        </p>
      )}

      {!cargando && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <p className="mt-2 text-sm text-red-600">
            Comprueba que el microservicio de catálogo esté encendido.
          </p>
        </div>
      )}

      {!cargando && !error && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtrados.map((p) => (
              <article
                key={p.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E0D8] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-[#EAE6DF]">
                  <img
                    src={obtenerRutaImagen(p)}
                    alt={p.nombre}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/imagenes/ultraboost.jpg";
                    }}
                    className="h-full w-full object-contain p-4 transition duration-500 hover:scale-110"
                  />

                  <button
                    onClick={() => manejarFavorito(p.id)}
                    aria-label={
                      favoritos.includes(p.id)
                        ? "Quitar de favoritos"
                        : "Agregar a favoritos"
                    }
                    className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-md transition hover:scale-110"
                  >
                    <Heart
                      className={
                        favoritos.includes(p.id)
                          ? "fill-red-400 text-red-400"
                          : "text-[#554F48]"
                      }
                    />
                  </button>

                  {p.categoria?.nombre && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#554F48]">
                      {p.categoria.nombre}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#766B5D]">
                      {p.marca}
                    </p>

                    <h3 className="mt-2 text-lg font-bold">{p.nombre}</h3>

                    {p.color && (
                      <p className="mt-2 text-sm text-[#77716A]">
                        Color: {p.color}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="mt-3 text-xl font-black">
                      {precio(p.precio)}
                    </p>

                    <p className="mt-2 text-xs font-semibold text-[#65816C]">
                      Consulta las tallas disponibles
                    </p>

                    <button
                      onClick={() => abrirSelector(p)}
                      className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#EAE6DF] py-3 font-bold text-[#393632] transition hover:bg-[#D8D1C7]"
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Agregar al carrito
                    </button>

                    <button
                      onClick={() => setZapatillaResenas(p)}
                      className="mt-2 w-full rounded-xl border border-[#766B5D] py-3 font-bold text-[#766B5D] transition hover:bg-[#EAE6DF]"
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
              No encontramos productos.
            </p>
          )}
        </>
      )}

      {/* MODAL DE TALLAS */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setProductoSeleccionado(null)}
              className="absolute right-4 top-4 rounded-full p-2 hover:bg-[#EAE6DF]"
              aria-label="Cerrar"
            >
              <X />
            </button>

            <p className="text-sm font-bold uppercase tracking-widest text-[#766B5D]">
              URBANSTEP
            </p>

            <h2 className="mt-2 pr-8 text-2xl font-black">
              {productoSeleccionado.nombre}
            </h2>

            <p className="mt-2 font-bold">
              {precio(productoSeleccionado.precio)}
            </p>

            {cargandoTallas ? (
              <p className="py-10 text-center text-[#77716A]">
                Consultando tallas disponibles...
              </p>
            ) : (
              <>
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-bold">
                    Selecciona una talla
                  </label>

                  <select
                    value={tallaSeleccionada}
                    onChange={(e) => {
                      setTallaSeleccionada(e.target.value);
                      setCantidad(1);
                      setErrorCarrito("");
                    }}
                    className="w-full rounded-xl border border-[#E5E0D8] bg-white p-3 outline-none focus:border-[#766B5D]"
                  >
                    <option value="">Seleccionar talla</option>

                    {inventarios.map((item) => (
                      <option key={item.id} value={item.talla}>
                        Talla {item.talla} — Stock: {item.cantidadDisponible}
                      </option>
                    ))}
                  </select>
                </div>

                {inventarioSeleccionado && (
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-bold">
                      Cantidad
                    </label>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() =>
                          setCantidad((actual) => Math.max(1, actual - 1))
                        }
                        disabled={cantidad <= 1}
                        className="rounded-lg bg-[#EAE6DF] p-2 disabled:opacity-40"
                      >
                        <Minus size={18} />
                      </button>

                      <span className="min-w-8 text-center text-lg font-bold">
                        {cantidad}
                      </span>

                      <button
                        onClick={() =>
                          setCantidad((actual) =>
                            Math.min(
                              inventarioSeleccionado.cantidadDisponible,
                              actual + 1
                            )
                          )
                        }
                        disabled={
                          cantidad >= inventarioSeleccionado.cantidadDisponible
                        }
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

            {errorCarrito && (
              <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                {errorCarrito}
              </p>
            )}

            <button
              onClick={agregarAlCarrito}
              disabled={
                cargandoTallas ||
                agregando ||
                inventarios.length === 0 ||
                !tallaSeleccionada
              }
              className="mt-6 w-full rounded-xl bg-[#393632] py-3 font-bold text-white transition hover:bg-[#5D554B] disabled:cursor-not-allowed disabled:opacity-50"
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
            <button
              onClick={() => setZapatillaResenas(null)}
              className="absolute right-4 top-4 rounded-full p-2 hover:bg-[#EAE6DF]"
              aria-label="Cerrar reseñas"
            >
              <X />
            </button>

            <p className="text-sm font-bold uppercase tracking-widest text-[#766B5D]">
              URBANSTEP
            </p>

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
