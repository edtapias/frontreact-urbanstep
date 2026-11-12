
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Receipt,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Loader2,
  ShoppingBag,
  Truck,
  Store,
} from "lucide-react";

import PagoService, {
  type Pago,
  type PagoRequest,
} from "../../../services/PagosService";

import CarritoService, {
  type Carrito,
} from "../../../services/CarritoService";

import PedidosService from "../../../services/PedidoService";
import EnviosService from "../../../services/EnviosService";

type MetodoEnvio = "DOMICILIO" | "RETIRO_TIENDA";

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rut: string;
}

export default function PagoPage() {
  const navigate = useNavigate();

  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Datos de facturación
  const [rut, setRut] = useState("");
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");

  // Método de pago
  const [metodoPago, setMetodoPago] = useState("TARJETA_CREDITO");

  // Datos de despacho
  const [metodoEnvio, setMetodoEnvio] =
    useState<MetodoEnvio>("DOMICILIO");

  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [direccionEnvio, setDireccionEnvio] = useState("");
  const [referencias, setReferencias] = useState("");

  // Cotización
  const [costoEnvio, setCostoEnvio] = useState<number | null>(null);
  const [cotizando, setCotizando] = useState(false);
  const [cotizacionLista, setCotizacionLista] = useState(false);

  // Estados generales
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [errorEnvio, setErrorEnvio] = useState("");
  const [pagoResultado, setPagoResultado] = useState<Pago | null>(null);

  // CARGAR USUARIO Y CARRITO
  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (!usuarioGuardado) {
          navigate("/login");
          return;
        }

        const usuarioActual: Usuario = JSON.parse(usuarioGuardado);

        if (!usuarioActual.id) {
          throw new Error("No se encontró el ID del usuario.");
        }

        if (activo) {
          setUsuario(usuarioActual);
          setRut(usuarioActual.rut || "");
          setNombre(usuarioActual.nombre || "");
        }

        const carritoActual = await CarritoService.obtener(
          usuarioActual.id
        );

        if (activo) {
          setCarrito(carritoActual);
        }
      } catch (err) {
        console.error("Error al cargar los datos:", err);

        if (activo) {
          setError(
            "No fue posible cargar el carrito. Intenta nuevamente."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, [navigate]);

  // CAMBIAR MÉTODO DE ENVÍO
  function cambiarMetodoEnvio(metodo: MetodoEnvio) {
    setMetodoEnvio(metodo);
    setError("");
    setErrorEnvio("");

    if (metodo === "RETIRO_TIENDA") {
      setCostoEnvio(0);
      setCotizacionLista(true);
    } else {
      setCostoEnvio(null);
      setCotizacionLista(false);
    }
  }

  // COTIZAR DESPACHO A DOMICILIO
  async function cotizarDespacho() {
    if (!region.trim() || !comuna.trim()) {
      setError("Selecciona o ingresa la región y comuna.");
      return;
    }

    setCotizando(true);
    setError("");
    setCotizacionLista(false);
    setCostoEnvio(null);

    try {
      const cotizacion = await EnviosService.cotizar(
        region.trim(),
        comuna.trim()
      );

      const costo = Number(cotizacion.costo);

      if (!Number.isFinite(costo) || costo < 0) {
        throw new Error("El servicio devolvió un costo de envío inválido.");
      }

      setCostoEnvio(costo);
      setCotizacionLista(true);
    } catch (err: any) {
      console.error("Error al cotizar envío:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "No fue posible calcular el costo del despacho."
      );
    } finally {
      setCotizando(false);
    }
  }

  // CONFIRMAR COMPRA Y PROCESAR PAGO
  async function confirmarPago(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (procesando) return;

    if (!usuario || !carrito) {
      setError("No se encontraron los datos del usuario o del carrito.");
      return;
    }

    if (!carrito.items || carrito.items.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    if (!rut.trim() || !nombre.trim() || !direccion.trim()) {
      setError("Completa todos los datos de facturación.");
      return;
    }

    if (Number(carrito.total) <= 0) {
      setError("El total de la compra no es válido.");
      return;
    }

    // Validar datos de despacho
    if (metodoEnvio === "DOMICILIO") {
      if (
        !region.trim() ||
        !comuna.trim() ||
        !direccionEnvio.trim()
      ) {
        setError("Completa la región, comuna y dirección de despacho.");
        return;
      }

      if (!cotizacionLista || costoEnvio === null) {
        setError("Primero debes cotizar el costo del despacho.");
        return;
      }
    }

    const costoFinal =
      metodoEnvio === "RETIRO_TIENDA" ? 0 : Number(costoEnvio);

    setProcesando(true);
    setError("");
    setErrorEnvio("");

    try {
      // 1. CREAR EL PEDIDO.
      // El backend debe recibir clienteId, costoEnvio y metodoEnvio.
      const pedidoCreado = await PedidosService.crear(
        usuario.id,
        costoFinal,
        metodoEnvio
      );

      console.log("Pedido creado:", pedidoCreado);

      if (!pedidoCreado.id) {
        throw new Error("No se recibió el ID del pedido creado.");
      }

      // 2. OBTENER LOS PRODUCTOS DEL CARRITO.
      const productos = carrito.items.map((item) => ({
        zapatillaId: item.productoId,
        talla: String(item.talla),
        cantidad: item.cantidad,
      }));

      // 3. PREPARAR EL PAGO.
      // Se utiliza el total que devuelve ms-pedidos.
      // No se suma nuevamente el costo del envío.
      const datos: PagoRequest = {
        pedidoId: pedidoCreado.id,
        usuarioId: usuario.id,
        montoTotal: Number(pedidoCreado.total),
        metodoPago,
        rutFacturacion: rut.trim(),
        nombreFacturacion: nombre.trim(),
        direccionFacturacion: direccion.trim(),
        productos,
      };

      console.log("Datos enviados al pago:", datos);

      // 4. REGISTRAR EL PAGO.
      const pagoCreado = await PagoService.iniciar(datos);

      console.log("Pago creado:", pagoCreado);

      // 5. PROCESAR EL PAGO.
      const resultado = await PagoService.procesar(
        pagoCreado.id,
        true
      );

      console.log("Resultado del pago:", resultado);

      // 6. CREAR EL ENVÍO SOLAMENTE SI EL PAGO FUE APROBADO.
      if (resultado.estado === "APROBADO") {
        // Guardamos el resultado para no perderlo si falla el envío.
        setPagoResultado(resultado);

        // Vaciar el carrito después de aprobarse el pago.
        try {
          await CarritoService.vaciar(usuario.id);
        } catch (err) {
          console.error("No se pudo vaciar el carrito:", err);
          setErrorEnvio(
            "El pago fue aprobado, pero no se pudo vaciar el carrito. Contacta con soporte antes de volver a comprar."
          );
        }

        // Registrar el envío con el mismo ID real del pedido.
        try {
          await EnviosService.registrar({
            pedidoId: pedidoCreado.id,
            metodoEnvio,
            region:
              metodoEnvio === "DOMICILIO" ? region.trim() : undefined,
            comuna:
              metodoEnvio === "DOMICILIO" ? comuna.trim() : undefined,
            direccionCompleta:
              metodoEnvio === "DOMICILIO"
                ? direccionEnvio.trim()
                : undefined,
            referencias:
              metodoEnvio === "DOMICILIO"
                ? referencias.trim()
                : undefined,
            costo: costoFinal,
          });

          console.log(
            "Envío registrado para el pedido:",
            pedidoCreado.id
          );
        } catch (err: any) {
          console.error("Error al registrar el envío:", err);

          setErrorEnvio(
            "Tu pago fue aprobado, pero no se pudo registrar el envío automáticamente. Tu pedido existe; contacta con soporte para gestionar el despacho. No vuelvas a pagar."
          );
        }
      } else {
        // Pago rechazado: no se crea ningún envío.
        setPagoResultado(resultado);
      }
    } catch (err: any) {
      console.error("Error al procesar la compra:", err);

      const mensaje =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "No se pudo procesar el pago.";

      setError(mensaje);
    } finally {
      setProcesando(false);
    }
  }

  // FORMATO DE PRECIO
  const formatoPrecio = (valor: number) =>
    Number(valor).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });

  const totalFinal =
    Number(carrito?.total || 0) +
    (metodoEnvio === "RETIRO_TIENDA"
      ? 0
      : Number(costoEnvio || 0));

  // CARGANDO
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-black" size={40} />
        <span className="ml-3 text-gray-600">
          Cargando pago...
        </span>
      </div>
    );
  }

  // RESULTADO DEL PAGO
  if (pagoResultado) {
    const aprobado = pagoResultado.estado === "APROBADO";

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white max-w-lg w-full rounded-2xl shadow-lg p-8 text-center">
          {aprobado ? (
            <CheckCircle
              className="mx-auto text-green-500 mb-4"
              size={65}
            />
          ) : (
            <XCircle
              className="mx-auto text-red-500 mb-4"
              size={65}
            />
          )}

          <h1 className="text-2xl font-bold mb-2">
            {aprobado ? "¡Pago exitoso!" : "Pago rechazado"}
          </h1>

          <p className="text-gray-500 mb-6">
            {aprobado
              ? "Tu pago fue procesado correctamente y tu pedido fue actualizado."
              : "No fue posible aprobar tu pago. No se ha registrado un envío."}
          </p>

          {errorEnvio && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 mb-5 text-sm text-left">
              {errorEnvio}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Número de pago</span>
              <strong>#{pagoResultado.id}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Número de pedido</span>
              <strong>#{pagoResultado.pedidoId}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Método de pago</span>
              <strong>{pagoResultado.metodoPago}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <strong>
                {formatoPrecio(Number(pagoResultado.montoTotal))}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Estado del pago</span>
              <strong
                className={aprobado ? "text-green-600" : "text-red-600"}
              >
                {pagoResultado.estado}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Tipo de entrega</span>
              <strong>
                {metodoEnvio === "DOMICILIO"
                  ? "Despacho a domicilio"
                  : "Retiro en tienda"}
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800"
          >
            Ver mis pedidos
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full mt-3 border border-gray-300 py-3 rounded-xl hover:bg-gray-50"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  // CARRITO VACÍO
  if (!carrito || !carrito.items || carrito.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <ShoppingBag size={55} className="text-gray-400" />

        <h2 className="text-2xl font-bold">
          Tu carrito está vacío
        </h2>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="bg-black text-white px-6 py-3 rounded-xl"
        >
          Ir a comprar
        </button>

        {error && <p className="text-red-600">{error}</p>}
      </div>
    );
  }

  // FORMULARIO DE PAGO
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/carrito")}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-8"
        >
          <ArrowLeft size={18} />
          Volver al carrito
        </button>

        <h1 className="text-3xl font-bold mb-2">
          Finalizar compra
        </h1>

        <p className="text-gray-500 mb-8">
          Completa tus datos para confirmar tu compra en UrbanStep.
        </p>

        <form
          onSubmit={confirmarPago}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            {/* DATOS DE FACTURACIÓN */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Receipt size={22} />
                <h2 className="text-xl font-bold">
                  Datos de facturación
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    RUT
                  </label>

                  <input
                    type="text"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    placeholder="12.345.678-9"
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre o razón social
                  </label>

                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin size={15} className="inline mr-1" />
                    Dirección de facturación
                  </label>

                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle, número, comuna y ciudad"
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>
            </section>

            {/* MÉTODO DE ENTREGA */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Truck size={22} />
                <h2 className="text-xl font-bold">
                  Método de entrega
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cambiarMetodoEnvio("DOMICILIO")}
                  className={`flex items-center gap-3 border rounded-xl p-4 text-left ${
                    metodoEnvio === "DOMICILIO"
                      ? "border-black bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <Truck size={22} />
                  <div>
                    <p className="font-semibold">Despacho a domicilio</p>
                    <p className="text-sm text-gray-500">
                      Recibe tu compra en casa
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => cambiarMetodoEnvio("RETIRO_TIENDA")}
                  className={`flex items-center gap-3 border rounded-xl p-4 text-left ${
                    metodoEnvio === "RETIRO_TIENDA"
                      ? "border-black bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <Store size={22} />
                  <div>
                    <p className="font-semibold">Retiro en tienda</p>
                    <p className="text-sm text-gray-500">
                      Sin costo de envío
                    </p>
                  </div>
                </button>
              </div>

              {metodoEnvio === "DOMICILIO" && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold">
                    Dirección de despacho
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Región
                    </label>

                    <input
                      type="text"
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value);
                        setCotizacionLista(false);
                        setCostoEnvio(null);
                      }}
                      placeholder="Ejemplo: Biobío"
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Comuna
                    </label>

                    <input
                      type="text"
                      value={comuna}
                      onChange={(e) => {
                        setComuna(e.target.value);
                        setCotizacionLista(false);
                        setCostoEnvio(null);
                      }}
                      placeholder="Ejemplo: Concepción"
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Calle y número
                    </label>

                    <input
                      type="text"
                      value={direccionEnvio}
                      onChange={(e) => setDireccionEnvio(e.target.value)}
                      placeholder="Ejemplo: Avenida principal 123"
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Referencias (opcional)
                    </label>

                    <textarea
                      value={referencias}
                      onChange={(e) => setReferencias(e.target.value)}
                      placeholder="Departamento, casa, indicaciones para llegar..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-black resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={cotizarDespacho}
                    disabled={cotizando}
                    className="w-full border border-black text-black py-3 rounded-xl hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {cotizando ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Calculando despacho...
                      </>
                    ) : (
                      "Calcular costo de envío"
                    )}
                  </button>

                  {cotizacionLista && costoEnvio !== null && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between">
                      <span className="text-green-800">
                        Costo de despacho
                      </span>
                      <strong className="text-green-800">
                        {formatoPrecio(costoEnvio)}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              {metodoEnvio === "RETIRO_TIENDA" && (
                <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-800">
                    Retiro en tienda sin costo
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Tu pedido quedará preparado para que puedas retirarlo
                    en la tienda.
                  </p>
                </div>
              )}
            </section>

            {/* MÉTODO DE PAGO */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard size={22} />
                <h2 className="text-xl font-bold">
                  Método de pago
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    valor: "TARJETA_CREDITO",
                    texto: "Tarjeta de crédito",
                  },
                  {
                    valor: "TARJETA_DEBITO",
                    texto: "Tarjeta de débito",
                  },
                  {
                    valor: "TRANSFERENCIA",
                    texto: "Transferencia bancaria",
                  },
                ].map((metodo) => (
                  <label
                    key={metodo.valor}
                    className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer ${
                      metodoPago === metodo.valor
                        ? "border-black bg-gray-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value={metodo.valor}
                      checked={metodoPago === metodo.valor}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />

                    <CreditCard size={20} />

                    <span className="font-medium">
                      {metodo.texto}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-5 flex gap-2 text-sm text-gray-500">
                <ShieldCheck size={19} className="shrink-0" />
                <p>
                  Este proyecto utiliza una simulación de procesamiento
                  de pagos. No ingreses datos reales de tarjetas.
                </p>
              </div>
            </section>
          </div>

          {/* RESUMEN DE COMPRA */}
          <aside className="bg-white rounded-2xl p-6 shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-6">
              Resumen de compra
            </h2>

            <div className="space-y-4 mb-6">
              {carrito.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {item.nombreProducto}
                    </p>

                    <p className="text-gray-500">
                      Talla {item.talla} · Cantidad {item.cantidad}
                    </p>
                  </div>

                  <strong className="whitespace-nowrap">
                    {formatoPrecio(Number(item.subtotal))}
                  </strong>
                </div>
              ))}
            </div>

            <hr className="my-5" />

            <div className="flex justify-between text-gray-600 mb-3">
              <span>Subtotal</span>
              <span>
                {formatoPrecio(Number(carrito.subtotal))}
              </span>
            </div>

            <div className="flex justify-between text-gray-600 mb-3">
              <span>IVA</span>
              <span>
                {formatoPrecio(Number(carrito.iva))}
              </span>
            </div>

            <div className="flex justify-between text-gray-600 mb-3">
              <span>Despacho</span>
              <span>
                {metodoEnvio === "RETIRO_TIENDA"
                  ? "Gratis"
                  : costoEnvio !== null && cotizacionLista
                    ? formatoPrecio(costoEnvio)
                    : "Por cotizar"}
              </span>
            </div>

            <hr className="my-5" />

            <div className="flex justify-between font-bold text-xl mt-5">
              <span>Total</span>
              <span>{formatoPrecio(totalFinal)}</span>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                procesando ||
                cotizando ||
                (metodoEnvio === "DOMICILIO" &&
                  (!cotizacionLista || costoEnvio === null))
              }
              className="w-full mt-6 bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {procesando ? (
                <>
                  <Loader2 className="animate-spin" size={19} />
                  Procesando...
                </>
              ) : (
                "Confirmar y pagar"
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Revisa tus datos antes de confirmar la compra.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
