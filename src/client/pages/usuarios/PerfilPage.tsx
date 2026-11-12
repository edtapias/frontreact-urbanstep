
import { useEffect, useState } from "react";
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
} from "lucide-react";

import UsuariosService from "../../../services/UsuariosService";
import type { Usuario } from "../../../services/UsuariosService";

import PedidosService from "../../../services/PedidoService";
import type { Pedido } from "../../../services/PedidoService";

export default function PerfilPage() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rut, setRut] = useState("");

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [errorPedidos, setErrorPedidos] = useState("");

  // Cargar usuario y su historial.
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) {
      navigate("/login");
      return;
    }

    try {
      const datos: Usuario = JSON.parse(usuarioGuardado);

      setUsuario(datos);
      setNombre(datos.nombre);
      setCorreo(datos.correo);
      setRut(datos.rut);

      cargarPedidos(datos.id);
    } catch (err) {
      console.error("Error al cargar usuario:", err);
      localStorage.removeItem("usuario");
      navigate("/login");
    }
  }, [navigate]);

  // Consultar pedidos del cliente.
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

  // Guardar información del perfil.
  const guardarCambios = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!usuario) return;

    try {
      setCargando(true);
      setError("");

      const respuesta = await UsuariosService.actualizar(
        usuario.id,
        {
          nombre,
          correo,
          rut,
        }
      );

      setUsuario(respuesta);
      localStorage.setItem("usuario", JSON.stringify(respuesta));

      alert("Perfil actualizado correctamente.");
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "No se pudieron guardar los cambios."
      );
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const formatoPrecio = (valor: number) =>
    Number(valor).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });

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

  if (!usuario) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F3EF]">
        <p className="text-[#77716A]">Cargando perfil...</p>
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

              <div className="rounded-lg bg-[#F5F3EF] p-4">
                <p className="text-xs text-[#77716A]">
                  Rol de usuario
                </p>

                <p className="mt-1 font-medium text-[#393632]">
                  {usuario.rol}
                </p>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#393632] py-3 font-semibold text-white transition hover:bg-[#766B5D] disabled:opacity-50"
              >
                <Save size={18} />
                {cargando ? "Guardando..." : "Guardar cambios"}
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
