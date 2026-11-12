
import { useEffect, useState } from "react";
import {
  Check,
  X,
  Star,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

import {
  ResenasService,
  type Resena,
} from "../../services/ResenasService";

export default function AdminResenasPage() {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarResenas = async () => {
    try {
      setCargando(true);
      setError("");

      const datos = await ResenasService.obtenerPendientes();
      setResenas(datos);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las reseñas."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarResenas();
  }, []);

  const moderar = async (
    id: number,
    estado: "APROBADA" | "RECHAZADA"
  ) => {
    try {
      setProcesando(id);
      setError("");
      setMensaje("");

      await ResenasService.moderar(id, estado);

      setResenas((actuales) =>
        actuales.filter((resena) => resena.id !== id)
      );

      setMensaje(
        estado === "APROBADA"
          ? "La reseña fue aprobada correctamente."
          : "La reseña fue rechazada correctamente."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo moderar la reseña."
      );
    } finally {
      setProcesando(null);
    }
  };

  return (
    <div className="w-full text-[#393632]">

      <header className="mb-10 flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="font-bold tracking-widest text-[#766B5D]">
            URBANSTEP / ADMINISTRACIÓN
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Moderación de reseñas
          </h1>

          <p className="mt-2 text-[#77716A]">
            Revisa y administra las opiniones enviadas por los clientes.
          </p>
        </div>

        <button
          onClick={cargarResenas}
          disabled={cargando}
          className="flex items-center gap-2 rounded-xl border border-[#E5E0D8] bg-white px-4 py-3 text-sm font-bold transition hover:bg-[#EAE6DF] disabled:opacity-50"
        >
          <RefreshCw size={18} />
          Actualizar
        </button>
      </header>

      <section className="mb-6 rounded-2xl border border-[#E5E0D8] bg-white p-6">
        <div className="flex items-center gap-4">
          <span className="rounded-xl bg-[#EAE6DF] p-3 text-[#766B5D]">
            <MessageSquare size={24} />
          </span>

          <div>
            <p className="text-sm text-[#77716A]">
              Reseñas pendientes de revisión
            </p>

            <h2 className="text-3xl font-black">
              {resenas.length}
            </h2>
          </div>
        </div>
      </section>

      {mensaje && (
        <div className="mb-5 rounded-xl bg-[#E4EAE2] p-4 text-sm font-semibold text-[#526B50]">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-10 text-center text-[#77716A]">
          Cargando reseñas...
        </div>
      ) : resenas.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-10 text-center">
          <MessageSquare
            size={40}
            className="mx-auto mb-4 text-[#766B5D]"
          />

          <h2 className="text-xl font-bold">
            No hay reseñas pendientes
          </h2>

          <p className="mt-2 text-sm text-[#77716A]">
            Cuando los clientes envíen nuevas reseñas, aparecerán aquí.
          </p>
        </div>
      ) : (
        <section className="space-y-5">
          {resenas.map((resena) => (
            <article
              key={resena.id}
              className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-widest text-[#766B5D]">
                    RESEÑA #{resena.id}
                  </p>

                  <p className="mt-2 text-sm text-[#77716A]">
                    Zapatilla ID: {resena.zapatillaId}
                  </p>

                  <p className="mt-1 text-sm text-[#77716A]">
                    Usuario ID: {resena.usuarioId}
                  </p>
                </div>

                <span className="rounded-full bg-[#F2EBDD] px-3 py-2 text-xs font-bold text-[#927343]">
                  PENDIENTE
                </span>
              </div>

              <div className="mt-5 flex items-center gap-1 text-yellow-400">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    size={20}
                    fill={
                      index < resena.puntuacion
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </div>

              <p className="mt-4 leading-relaxed text-[#393632]">
                {resena.comentario}
              </p>

              <p className="mt-4 text-xs text-[#91897F]">
                Fecha:{" "}
                {new Date(resena.fechaCreacion).toLocaleDateString("es-CL")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-[#F0EDE8] pt-5">
                <button
                  onClick={() => moderar(resena.id, "APROBADA")}
                  disabled={procesando !== null}
                  className="flex items-center gap-2 rounded-xl bg-[#526B50] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#40563E] disabled:opacity-50"
                >
                  <Check size={18} />
                  Aprobar
                </button>

                <button
                  onClick={() => moderar(resena.id, "RECHAZADA")}
                  disabled={procesando !== null}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <X size={18} />
                  Rechazar
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
