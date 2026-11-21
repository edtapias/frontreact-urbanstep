
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Estrellas from "./Estrellas";
import { useResenas } from "../../hooks/useResenas";

interface Props {
  zapatillaId: number;
}

interface Pedido {
  id: number;
  clienteId: number;
  estado: string;
  detalles: {
    productoId: number;
  }[];
}

export default function ResenasSection({ zapatillaId }: Props) {
  const {
    resenas,
    loading,
    error,
    cargarResenas,
    publicarResena,
  } = useResenas(zapatillaId);

  const [puntuacion, setPuntuacion] = useState(5);
  const [filtro, setFiltro] = useState("");
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [pedidosDisponibles, setPedidosDisponibles] = useState<Pedido[]>([]);
  const [pedidoId, setPedidoId] = useState<number | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (!usuarioGuardado) {
          setCargandoPedidos(false);
          return;
        }

        const usuario = JSON.parse(usuarioGuardado);
        const id = Number(usuario.id ?? usuario.usuarioId);

        if (!id || Number.isNaN(id)) {
          setCargandoPedidos(false);
          return;
        }

        setUsuarioId(id);

        const respuesta = await fetch(`/api/pedidos/cliente/${id}`);

        if (!respuesta.ok) {
          throw new Error("No se pudieron consultar tus pedidos");
        }

        const pedidos: Pedido[] = await respuesta.json();

        const pedidosValidos = pedidos.filter((pedido) =>
          pedido.estado === "ENTREGADO" &&
          pedido.detalles?.some(
            (detalle) => Number(detalle.productoId) === zapatillaId
          )
        );

        setPedidosDisponibles(pedidosValidos);

        if (pedidosValidos.length > 0) {
          setPedidoId(pedidosValidos[0].id);
        }
      } catch {
        setMensaje("No se pudieron consultar tus compras.");
      } finally {
        setCargandoPedidos(false);
      }
    };

    cargarPedidos();
  }, [zapatillaId]);

  const enviarResena = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje("");

    if (!usuarioId) {
      setMensaje("Debes iniciar sesión para escribir una reseña.");
      return;
    }

    if (!pedidoId) {
      setMensaje("No tienes una compra entregada de esta zapatilla.");
      return;
    }

    if (!comentario.trim()) {
      setMensaje("Debes escribir un comentario.");
      return;
    }

    try {
      setEnviando(true);

      const resultado = await publicarResena({
        pedidoId,
        zapatillaId,
        usuarioId,
        puntuacion,
        comentario: comentario.trim(),
      });

      if (resultado) {
        setMensaje("¡Reseña enviada! Quedará pendiente de aprobación.");
        setComentario("");
        setPuntuacion(5);
      } else {
        setMensaje("No se pudo enviar la reseña. Inténtalo nuevamente.");
      }
    } catch {
      setMensaje("No se pudo enviar la reseña. Verifica tu compra e inténtalo nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  const cambiarFiltro = (valor: string) => {
    setFiltro(valor);
    cargarResenas(valor ? Number(valor) : undefined);
  };

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Opiniones de clientes
      </h2>

      <div className="mb-8 rounded-xl bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold">
          Escribe tu reseña
        </h3>

        {cargandoPedidos ? (
          <p className="text-sm text-gray-500">
            Verificando tus compras...
          </p>
        ) : !usuarioId ? (
          <p className="text-sm text-gray-600">
            Debes iniciar sesión para escribir una reseña.
          </p>
        ) : pedidosDisponibles.length === 0 ? (
          <p className="text-sm text-gray-600">
            Solo puedes reseñar esta zapatilla si la compraste y recibiste tu pedido.
          </p>
        ) : (
          <form onSubmit={enviarResena}>
            {pedidosDisponibles.length > 1 && (
              <>
                <label className="mb-2 block font-medium">
                  Selecciona tu compra
                </label>

                <select
                  value={pedidoId ?? ""}
                  onChange={(e) => setPedidoId(Number(e.target.value))}
                  className="mb-5 w-full rounded-lg border border-gray-300 p-3"
                >
                  {pedidosDisponibles.map((pedido) => (
                    <option key={pedido.id} value={pedido.id}>
                      Pedido #{pedido.id}
                    </option>
                  ))}
                </select>
              </>
            )}

            <label className="mb-2 block font-medium">
              Tu puntuación
            </label>

            <Estrellas
              puntuacion={puntuacion}
              seleccionable
              onChange={setPuntuacion}
              tamano={28}
            />

            <label className="mb-2 mt-5 block font-medium">
              Tu comentario
            </label>

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos qué te pareció esta zapatilla..."
              rows={4}
              maxLength={1000}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
            />

            <button
              type="submit"
              disabled={enviando}
              className="mt-4 rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Publicar reseña"}
            </button>
          </form>
        )}

        {mensaje && (
          <p className="mt-3 text-sm text-gray-700">
            {mensaje}
          </p>
        )}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label htmlFor="filtro-resenas" className="font-medium">
          Filtrar por puntuación:
        </label>

        <select
          id="filtro-resenas"
          value={filtro}
          onChange={(e) => cambiarFiltro(e.target.value)}
          className="rounded-lg border border-gray-300 p-2"
        >
          <option value="">Todas las puntuaciones</option>
          <option value="5">5 estrellas</option>
          <option value="4">4 estrellas</option>
          <option value="3">3 estrellas</option>
          <option value="2">2 estrellas</option>
          <option value="1">1 estrella</option>
        </select>
      </div>

      <h3 className="mb-4 text-lg font-semibold">
        Reseñas de este producto
      </h3>

      {loading && <p>Cargando reseñas...</p>}

      {error && (
        <p className="text-red-600">{error}</p>
      )}

      {!loading && !error && resenas.length === 0 && (
        <p className="text-gray-500">
          Este producto todavía no tiene reseñas aprobadas.
        </p>
      )}

      <div className="space-y-4">
        {!loading && resenas.map((resena) => (
          <article
            key={resena.id}
            className="rounded-xl border border-gray-200 p-5"
          >
            <Estrellas puntuacion={resena.puntuacion} />

            <p className="mt-3 text-gray-700">
              {resena.comentario}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              {resena.fechaCreacion
                ? new Date(resena.fechaCreacion).toLocaleDateString("es-CL")
                : ""}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
