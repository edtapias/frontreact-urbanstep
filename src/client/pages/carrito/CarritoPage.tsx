
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CreditCard,
  Loader2,
} from "lucide-react";

import CarritoService, {
  type Carrito,
} from "../../../services/CarritoService";

export default function CarritoPage() {
  const navigate = useNavigate();

  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  const clienteId: number | null = usuario?.id
    ? Number(usuario.id)
    : null;

  // Cargar carrito
  const cargarCarrito = async () => {
    if (!clienteId) {
      setCarrito(null);
      setCargando(false);
      return;
    }

    try {
      setError("");
      const respuesta = await CarritoService.obtener(clienteId);
      setCarrito(respuesta);
    } catch (error) {
      console.error("Error al cargar carrito:", error);
      setCarrito(null);
      setError(
        "No fue posible cargar el carrito. Comprueba que el servicio esté encendido."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarCarrito();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cambiar cantidad
  const cambiarCantidad = async (itemId: number, cantidad: number) => {
    if (!clienteId || cantidad < 1 || procesando) return;

    try {
      setProcesando(true);
      setError("");

      const respuesta = await CarritoService.actualizarCantidad(
        clienteId,
        itemId,
        cantidad
      );

      setCarrito(respuesta);
    } catch (error: any) {
      console.error("Error al actualizar cantidad:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.mensaje ||
          "No se pudo actualizar la cantidad. Revisa el stock disponible."
      );
    } finally {
      setProcesando(false);
    }
  };

  // Eliminar producto
  const eliminarProducto = async (itemId: number) => {
    if (!clienteId || procesando) return;

    try {
      setProcesando(true);
      setError("");

      await CarritoService.eliminar(clienteId, itemId);
      const respuesta = await CarritoService.obtener(clienteId);
      setCarrito(respuesta);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setError("No se pudo eliminar el producto.");
    } finally {
      setProcesando(false);
    }
  };

  // Vaciar carrito
  const vaciarCarrito = async () => {
    if (!clienteId || procesando) return;

    if (!window.confirm("¿Deseas vaciar tu carrito?")) return;

    try {
      setProcesando(true);
      setError("");

      await CarritoService.vaciar(clienteId);

      const respuesta = await CarritoService.obtener(clienteId);
      setCarrito(respuesta);
    } catch (error) {
      console.error("Error al vaciar carrito:", error);
      setError("No se pudo vaciar el carrito.");
    } finally {
      setProcesando(false);
    }
  };

  // Ir a pagar
  const continuarAlPago = () => {
    if (!clienteId) {
      navigate("/login");
      return;
    }

    if (!carrito || carrito.items.length === 0) {
      setError("Agrega productos antes de continuar con el pago.");
      return;
    }

    navigate("/pago");
  };

  // Formato de precios
  const formatoPrecio = (precio: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(precio) || 0);

  // Cargando
  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3EF]">
        <Loader2 className="animate-spin text-[#766B5D]" size={35} />
        <p className="ml-3 text-[#766B5D]">Cargando carrito...</p>
      </div>
    );
  }

  // Usuario no autenticado
  if (!clienteId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F3EF] px-6">
        <ShoppingBag size={65} className="mb-5 text-[#766B5D]" />

        <h1 className="text-3xl font-bold text-[#393632]">
          Inicia sesión para ver tu carrito
        </h1>

        <p className="mb-6 mt-3 text-center text-[#77716A]">
          Necesitas iniciar sesión para consultar tus productos.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="rounded-lg bg-[#393632] px-7 py-3 text-white hover:bg-[#766B5D]"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  // Error de carga
  if (error && !carrito) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F3EF] px-6">
        <ShoppingBag size={60} className="mb-5 text-[#766B5D]" />

        <h1 className="text-2xl font-bold text-[#393632]">
          No pudimos cargar tu carrito
        </h1>

        <p className="mb-6 mt-3 text-center text-red-600">{error}</p>

        <button
          onClick={() => {
            setCargando(true);
            void cargarCarrito();
          }}
          className="rounded-lg bg-[#393632] px-7 py-3 text-white hover:bg-[#766B5D]"
        >
          Volver a intentar
        </button>
      </div>
    );
  }

  // Carrito vacío
  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F3EF] px-6">
        <ShoppingBag size={65} className="mb-5 text-[#766B5D]" />

        <h1 className="text-3xl font-bold text-[#393632]">
          Tu carrito está vacío
        </h1>

        <p className="mb-6 mt-3 text-center text-[#77716A]">
          Agrega tus zapatillas favoritas para comenzar tu compra.
        </p>

        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-[#393632] px-7 py-3 text-white hover:bg-[#766B5D]"
        >
          Ir al catálogo
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F3EF] px-6 py-10">
      <div className="mx-auto w-full max-w-7xl">

        {/* ENCABEZADO */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm tracking-widest text-[#766B5D]">
              URBANSTEP
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#393632]">
              Mi carrito
            </h1>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#766B5D] hover:text-[#393632]"
          >
            <ArrowLeft size={18} />
            Seguir comprando
          </button>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* PRODUCTOS */}
          <section className="space-y-4 lg:col-span-2">
            {carrito.items.map((item) => {
              const imagen =
                item.imagenUrl ||
                item.imagen ||
                item.urlImagen ||
                "/imagenes/ultraboost.jpg";

              return (
                <article
                  key={item.id}
                  className="flex flex-col gap-5 rounded-xl bg-white p-5 shadow-sm sm:flex-row"
                >
                  <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#EAE6DF] sm:w-36">
                    <img
                      src={imagen}
                      alt={item.nombreProducto}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/imagenes/ultraboost.jpg";
                      }}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-lg font-semibold text-[#393632]">
                          {item.nombreProducto}
                        </h2>

                        <button
                          onClick={() => eliminarProducto(item.id)}
                          disabled={procesando}
                          aria-label="Eliminar producto"
                          className="text-red-500 hover:text-red-700 disabled:opacity-40"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <p className="mt-2 text-sm text-[#77716A]">
                        Talla: {item.talla}
                      </p>

                      <p className="mt-1 text-sm text-[#77716A]">
                        Precio: {formatoPrecio(item.precioUnitario)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            cambiarCantidad(item.id, item.cantidad - 1)
                          }
                          disabled={item.cantidad <= 1 || procesando}
                          className="rounded-lg border border-[#E5E0D8] p-2 hover:bg-[#EAE6DF] disabled:opacity-40"
                        >
                          <Minus size={15} />
                        </button>

                        <span className="min-w-6 text-center font-semibold">
                          {item.cantidad}
                        </span>

                        <button
                          onClick={() =>
                            cambiarCantidad(item.id, item.cantidad + 1)
                          }
                          disabled={procesando}
                          className="rounded-lg border border-[#E5E0D8] p-2 hover:bg-[#EAE6DF] disabled:opacity-40"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <p className="font-bold text-[#393632]">
                        {formatoPrecio(item.subtotal)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* RESUMEN DE COMPRA */}
          <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-[#393632]">
              Resumen de compra
            </h2>

            <div className="mb-4 flex justify-between text-[#77716A]">
              <span>Productos</span>
              <span>
                {carrito.items.reduce(
                  (total, item) => total + item.cantidad,
                  0
                )}
              </span>
            </div>

            <div className="mb-4 flex justify-between text-[#77716A]">
              <span>Subtotal</span>
              <span>{formatoPrecio(carrito.subtotal)}</span>
            </div>

            <div className="mb-4 flex justify-between text-[#77716A]">
              <span>IVA</span>
              <span>{formatoPrecio(carrito.iva)}</span>
            </div>

            <div className="mb-4 flex justify-between text-[#77716A]">
              <span>Descuento</span>
              <span>-{formatoPrecio(carrito.descuento)}</span>
            </div>

            <div className="flex justify-between border-t border-[#E5E0D8] pt-4 font-bold text-[#393632]">
              <span>Total</span>
              <span>{formatoPrecio(carrito.total)}</span>
            </div>

            {/* BOTÓN PARA IR A PAGOS */}
            <button
              type="button"
              onClick={continuarAlPago}
              disabled={procesando}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#393632] py-3 font-bold text-white transition hover:bg-[#766B5D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard size={19} />
              Continuar al pago
            </button>

            <button
              onClick={vaciarCarrito}
              disabled={procesando}
              className="mt-4 w-full text-red-500 hover:text-red-700 disabled:opacity-40"
            >
              Vaciar carrito
            </button>

            {procesando && (
              <p className="mt-3 text-center text-xs text-[#766B5D]">
                Actualizando carrito...
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
