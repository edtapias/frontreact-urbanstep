
import { useNavigate } from "react-router";
import { Heart, Trash2 } from "lucide-react";
import { useProductos } from "../../../hooks/useProductos";
import { useFavoritos } from "../../../hooks/useFavoritos";

export default function MisFavoritosPage() {
  const navigate = useNavigate();

  const { productos, cargando, error } = useProductos();

  const {
    favoritos,
    cargandoFavoritos,
    errorFavoritos,
    toggleFavorito,
    usuarioId,
  } = useFavoritos();

  const precio = (valor: number) =>
    valor.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });

  if (!usuarioId) {
    return (
      <main className="min-h-[60vh] px-6 py-20 text-center">
        <Heart className="mx-auto mb-4 h-12 w-12 text-[#766B5D]" />

        <h1 className="text-3xl font-black">Mis favoritos</h1>

        <p className="mt-3 text-[#77716A]">
          Inicia sesión para consultar tus zapatillas favoritas.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-6 rounded-xl bg-[#393632] px-8 py-3 font-bold text-white"
        >
          Iniciar sesión
        </button>
      </main>
    );
  }

  const productosFavoritos = productos.filter((producto) =>
    favoritos.includes(producto.id)
  );

  const quitarFavorito = async (productoId: number) => {
    await toggleFavorito(productoId);
  };

  return (
    <main className="min-h-[60vh] w-full px-8 py-16 lg:px-20">
      <div className="mb-10">
        <p className="font-bold tracking-widest text-[#766B5D]">
          TU COLECCIÓN PERSONAL
        </p>

        <h1 className="mt-3 text-4xl font-black">
          MIS FAVORITOS.
        </h1>

        <p className="mt-3 text-[#77716A]">
          Aquí encontrarás las zapatillas que has guardado.
        </p>
      </div>

      {(cargando || cargandoFavoritos) && (
        <p className="py-12 text-center text-[#77716A]">
          Cargando favoritos...
        </p>
      )}

      {!cargando && !cargandoFavoritos && (error || errorFavoritos) && (
        <p className="py-12 text-center text-red-600">
          {error || errorFavoritos}
        </p>
      )}

      {!cargando && !cargandoFavoritos && !error && !errorFavoritos && (
        <>
          {productosFavoritos.length === 0 ? (
            <div className="py-16 text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-[#B7AEA3]" />

              <h2 className="text-xl font-bold">
                Todavía no tienes favoritos
              </h2>

              <p className="mt-2 text-[#77716A]">
                Explora el catálogo y guarda las zapatillas que te gusten.
              </p>

              <button
                onClick={() => navigate("/#catalogo")}
                className="mt-6 rounded-xl bg-[#393632] px-8 py-3 font-bold text-white"
              >
                Explorar zapatillas
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {productosFavoritos.map((p) => (
                <article
                  key={p.id}
                  className="overflow-hidden rounded-2xl border border-[#E5E0D8] bg-white"
                >
                  <div className="relative aspect-square bg-[#EAE6DF]">
                    <img
                      src={
                        p.imagenUrl?.includes("ejemplo.com")
                          ? "/imagenes/ultraboost.jpg"
                          : p.imagenUrl || "/imagenes/ultraboost.jpg"
                      }
                      alt={p.nombre}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/imagenes/ultraboost.jpg";
                      }}
                      className="h-full w-full object-contain p-4"
                    />

                    <button
                      onClick={() => quitarFavorito(p.id)}
                      aria-label="Quitar de favoritos"
                      className="absolute right-4 top-4 rounded-full bg-white p-2 shadow"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-bold uppercase text-[#766B5D]">
                      {p.marca}
                    </p>

                    <h2 className="mt-2 text-lg font-bold">
                      {p.nombre}
                    </h2>

                    <p className="mt-3 text-xl font-black">
                      {precio(p.precio)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
