
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
  UserRound,
  Save,
  LogOut,
  ArrowLeft,
  ShoppingBag,
  Loader2,
  Package,
  RefreshCw,
  MapPin,
} from "lucide-react";

import UsuariosService from "../../../services/UsuariosService";
import type { Usuario } from "../../../services/UsuariosService";

import PedidosService from "../../../services/PedidoService";
import type { Pedido } from "../../../services/PedidoService";

export default function PerfilPage() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Datos personales
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rut, setRut] = useState("");

  // Datos de dirección
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [direccion, setDireccion] = useState("");
  const [referencias, setReferencias] = useState("");

  // Pedidos
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  // Estados generales
  const [cargando, setCargando] = useState(false);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [error, setError] = useState("");
  const [errorPedidos, setErrorPedidos] = useState("");

  // Cargar usuario desde la base de datos
  useEffect(() => {
    const cargarPerfil = async () => {
      const usuarioGuardado = localStorage.getItem("usuario");

      if (!usuarioGuardado) {
        navigate("/login");
        return;
      }

      try {
        const datos: Usuario = JSON.parse(usuarioGuardado);

        if (!datos.id) {
          throw new Error("No se encontró el ID del usuario.");
        }

        // Consultar los datos actualizados del backend
        const respuesta = await UsuariosService.obtener(datos.id);

        setUsuario(respuesta);

        setNombre(respuesta.nombre || "");
        setCorreo(respuesta.correo || "");
        setRut(respuesta.rut || "");

        // Cargar dirección guardada
        setRegion(respuesta.region || "");
        setComuna(respuesta.comuna || "");
        setDireccion(respuesta.direccion || "");
        setReferencias(respuesta.referencias || "");

        // Actualizar localStorage
        localStorage.setItem("usuario", JSON.stringify(respuesta));

        // Cargar historial de pedidos
        cargarPedidos(respuesta.id);
      } catch (err) {
        console.error("Error al cargar perfil:", err);

        setError(
          "No se pudo cargar tu perfil. Intenta iniciar sesión nuevamente."
        );
      } finally {
        setCargandoPerfil(false);
      }
    };

    cargarPerfil();
  }, [navigate]);

  // Consultar pedidos del cliente
  const cargarPedidos = async (clienteId: number) => {
    try {
      setCargandoPedidos(true);
      setErrorPedidos("");

      const resultado =
        await PedidosService.listarPorCliente(clienteId);

      setPedidos(resultado);
    } catch (err: any) {
      console.error("Error al cargar pedidos:", err);

      setErrorPedidos(
        err.response?.data?.message ||
          "No se pudo cargar tu historial de pedidos."
      );
    } finally {
      setCargandoPedidos(false);
    }
  };

  // Guardar información del perfil y dirección
  const guardarCambios = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!usuario) return;

    try {
      setCargando(true);
      setError("");

      const respuesta = await UsuariosService.actualizar(
        usuario.id,
        {
          nombre: nombre.trim(),
          correo: correo.trim(),
          rut: rut.trim(),
          region: region.trim(),
          comuna: comuna.trim(),
          direccion: direccion.trim(),
          referencias: referencias.trim(),
        }
      );

      // Actualizar información en pantalla
      setUsuario(respuesta);

      // Actualizar información guardada en el navegador
      localStorage.setItem("usuario", JSON.stringify(respuesta));

      // Sincronizar los campos con la respuesta del backend
      setNombre(respuesta.nombre || "");
      setCorreo(respuesta.correo || "");
      setRut(respuesta.rut || "");
      setRegion(respuesta.region || "");
      setComuna(respuesta.comuna || "");
      setDireccion(respuesta.direccion || "");
      setReferencias(respuesta.referencias || "");

      alert("Perfil y dirección actualizados correctamente.");
    } catch (err: any) {
      console.error("Error al actualizar perfil:", err);

      setError(
        err.response?.data?.message ||
          "No se pudieron guardar los cambios. Intenta nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  // Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  // Formato de precios
  const formatoPrecio = (valor: number) =>
    Number(valor).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });

  // Colores según estado del pedido
  const colorEstado = (estado: string) => {
    switch (estado) {
      case "PAGADO":
        return "bg-green-100 text-green-700";
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-700";
      case "EN_PREPARACION":
        return "bg-blue-100 text-blue-700";
      case "ENVIADO":
        return "bg-purple-100 text-purple-700";
      case "ENTREGADO":
        return "bg-emerald-100 text-emerald-700";
      case "CANCELADO":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Pantalla de carga
  if (cargandoPerfil) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F3EF]">
        <Loader2 className="animate-spin" size={30} />
        <span className="ml-3 text-[#77716A]">
          Cargando perfil...
        </span>
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F3EF] px-4">
        <div className="text-center">
          <p className="mb-4 text-red-700">
            {error || "No se pudo cargar tu perfil."}
          </p>

          <button
            onClick={() => navigate("/login")}
            className="rounded-lg bg-[#393632] px-6 py-3 text-white"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F3EF] px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* ENCABEZADO */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#77716A] hover:text-[#393632]"
          >
            <ArrowLeft size={18} />
            Volver a la tienda
          </Link>

          <button
            onClick={cerrarSesion}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D8D1C8] px-4 py-2 text-sm text-[#393632] hover:bg-[#E5E0D8]"
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>

        {/* PERFIL */}
        <section className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="bg-[#E5E0D8] px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white">
              <UserRound size={38} className="text-[#766B5D]" />
            </div>

            <h1 className="text-2xl font-bold text-[#393632]">
              Mi perfil
            </h1>

            <p className="mt-2 text-sm text-[#77716A]">
              Administra la información de tu cuenta UrbanStep.
            </p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#393632]">
                Información personal
              </h2>

              <p className="mt-1 text-sm text-[#77716A]">
                Modifica tus datos y guarda los cambios.
              </p>
            </div>

            <form onSubmit={guardarCambios} className="space-y-5">

              {/* NOMBRE */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nombre completo
                </label>

                <input
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E0D8] px-4 py-3 outline-none focus:border-[#766B5D]"
                />
              </div>

              {/* RUT */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  RUT
                </label>

                <input
                  required
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E0D8] px-4 py-3 outline-none focus:border-[#766B5D]"
                />
              </div>

              {/* CORREO */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Correo electrónico
                </label>

                <input
                  required
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E0D8] px-4 py-3 outline-none focus:border-[#766B5D]"
                />
              </div>

              {/* ROL */}
              <div className="rounded-lg bg-[#F5F3EF] p-4">
                <p className="text-xs text-[#77716A]">
                  Rol de usuario
                </p>

                <p className="mt-1 font-medium text-[#393632]">
                  {usuario.rol}
                </p>
              </div>

              {/* DIRECCIÓN */}
              <div className="border-t border-[#E5E0D8] pt-6">
                <div className="mb-5 flex items-center gap-3">
                  <MapPin size={23} className="text-[#766B5D]" />

                  <div>
                    <h2 className="text-lg font-semibold text-[#393632]">
                      Dirección de despacho
                    </h2>

                    <p className="mt-1 text-sm text-[#77716A]">
                      Guarda tu dirección para utilizarla en tus próximas compras.
                    </p>
                  </div>
                </div>

                {/* REGIÓN */}
                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium">
                    Región
                  </label>

                  <input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Ejemplo: Biobío"
                    className="w-full rounded-lg border border-[#E5E0D8] px-4 py-3 outline-none focus:border-[#766B5D]"
                  />
                </div>

                {/* COMUNA */}
                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium">
                    Comuna
                  </label>

                  <input
                    value={comuna}
                    onChange={(e) => setComuna(e.target.value)}
                    placeholder="Ejemplo: Coronel"
                    className="w-full rounded-lg border border-[#E5E0D8] px-4 py-3 outline-none focus:border-[#766B5D]"
                  />
                </div>

                {/* DIRECCIÓN */}
                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium">
                    Dirección
                  </label>

                  <input
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle, número y departamento"
                    className="w-full rounded-lg border border-[#E5E0D8] px-4 py-3 outline-none focus:border-[#766B5D]"
                  />
                </div>

                {/* REFERENCIAS */}
                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium">
                    Referencias adicionales (opcional)
                  </label>

                  <textarea
                    value={referencias}
                    onChange={(e) => setReferencias(e.target.value)}
                    placeholder="Ejemplo: Casa blanca, portón negro, cerca de la plaza."
                    rows={3}
                    className="w-full resize-y rounded-lg border border-[#E5E0D8] px-4 py-3 outline-none focus:border-[#766B5D]"
                  />
                </div>
              </div>

              {/* MENSAJE DE ERROR */}
              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {/* GUARDAR */}
              <button
                type="submit"
                disabled={cargando}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#393632] py-3 font-semibold text-white transition hover:bg-[#766B5D] disabled:opacity-50"
              >
                {cargando ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Guardando cambios...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar cambios
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* HISTORIAL DE PEDIDOS */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E0D8] p-6 sm:p-8">
            <div>
              <div className="flex items-center gap-3">
                <ShoppingBag size={23} />

                <h2 className="text-xl font-bold">
                  Mis pedidos
                </h2>
              </div>

              <p className="mt-2 text-sm text-[#77716A]">
                Consulta tus compras y el estado de tus pedidos.
              </p>
            </div>

            <button
              onClick={() => cargarPedidos(usuario.id)}
              disabled={cargandoPedidos}
              className="flex items-center gap-2 rounded-lg border border-[#D8D1C8] px-4 py-2 text-sm hover:bg-[#F5F3EF] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={cargandoPedidos ? "animate-spin" : ""}
              />
              Actualizar
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {cargandoPedidos ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin" size={30} />

                <span className="ml-3 text-[#77716A]">
                  Cargando tus pedidos...
                </span>
              </div>
            ) : errorPedidos ? (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {errorPedidos}
              </div>
            ) : pedidos.length === 0 ? (
              <div className="py-10 text-center">
                <Package
                  size={45}
                  className="mx-auto mb-4 text-[#B5ADA3]"
                />

                <h3 className="font-semibold">
                  Todavía no tienes pedidos
                </h3>

                <p className="mt-2 text-sm text-[#77716A]">
                  Cuando realices una compra, aparecerá aquí.
                </p>

                <Link
                  to="/"
                  className="mt-5 inline-block rounded-lg bg-[#393632] px-6 py-3 text-sm font-semibold text-white hover:bg-[#766B5D]"
                >
                  Ir a comprar
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {pedidos.map((pedido) => (
                  <article
                    key={pedido.id}
                    className="rounded-xl border border-[#E5E0D8] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-[#393632]">
                          Pedido #{pedido.id}
                        </h3>

                        <p className="mt-1 text-xs text-[#77716A]">
                          {new Date(
                            pedido.fechaCreacion
                          ).toLocaleString("es-CL")}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${colorEstado(
                          pedido.estado
                        )}`}
                      >
                        {pedido.estado.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div className="my-4 space-y-3">
                      {pedido.detalles?.map((detalle) => (
                        <div
                          key={detalle.id}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <div>
                            <p className="font-medium">
                              {detalle.nombreProducto}
                            </p>

                            <p className="text-xs text-[#77716A]">
                              Talla {detalle.talla} · Cantidad{" "}
                              {detalle.cantidad}
                            </p>
                          </div>

                          <span className="whitespace-nowrap">
                            {formatoPrecio(
                              detalle.precioUnitario *
                                detalle.cantidad
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between border-t border-[#E5E0D8] pt-4">
                      <span className="font-semibold">
                        Total
                      </span>

                      <strong className="text-lg">
                        {formatoPrecio(pedido.total)}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
