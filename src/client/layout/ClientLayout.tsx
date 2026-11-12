
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import {
  ShoppingBag,
  Menu,
  UserRound,
  X,
  LogOut,
  Heart,
} from "lucide-react";

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rut: string;
  rol: string;
}

const enlaces = [
  ["Inicio", "/"],
  ["Zapatillas", "/catalogo"],
  ["Nosotros", "/#nosotros"],
  ["Contacto", "/#contacto"],
];

export default function ClientLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarUsuario = () => {
      try {
        const guardado = localStorage.getItem("usuario");
        setUsuario(guardado ? JSON.parse(guardado) : null);
      } catch {
        localStorage.removeItem("usuario");
        setUsuario(null);
      }
    };

    cargarUsuario();
    window.addEventListener("storage", cargarUsuario);

    return () => window.removeEventListener("storage", cargarUsuario);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setMenuAbierto(false);
    navigate("/");
  };

  const esAdmin = usuario?.rol?.toUpperCase() === "ADMIN";

  return (
    <div className="min-h-screen w-full bg-[#F5F3EF] text-[#393632]">
      <header className="sticky top-0 z-50 border-b border-[#E5E0D8] bg-[#F5F3EF]/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-5 lg:px-20">
          <Link to="/" className="text-2xl font-black">
            URBAN<span className="text-[#766B5D]">STEP.</span>
          </Link>

          <nav className="hidden gap-8 text-sm font-semibold md:flex">
            {enlaces.map(([nombre, ruta]) => (
              <Link
                key={ruta}
                to={ruta}
                className="hover:text-[#766B5D]"
              >
                {nombre}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            {usuario ? (
              <>
                <Link
                  to="/perfil"
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <UserRound size={21} />
                  <span className="hidden lg:block">
                    Hola, {usuario.nombre}
                  </span>
                </Link>

                {esAdmin && (
                  <Link
                    to="/admin/resenas"
                    className="hidden text-sm font-semibold hover:text-[#766B5D] lg:block"
                  >
                    Reseñas
                  </Link>
                )}

                <button
                  onClick={cerrarSesion}
                  className="hidden items-center gap-2 text-sm sm:flex"
                >
                  <LogOut size={19} />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2">
                  <UserRound size={21} />
                  <span className="hidden text-sm font-semibold lg:block">
                    Mi cuenta
                  </span>
                </Link>

                <Link
                  to="/registro"
                  className="hidden text-sm font-semibold sm:block"
                >
                  Crear cuenta
                </Link>
              </>
            )}

            <Link to="/favoritos" aria-label="Favoritos">
              <Heart size={21} />
            </Link>

            <Link to="/carrito" aria-label="Carrito">
              <ShoppingBag size={21} />
            </Link>

            <button
              className="md:hidden"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              {menuAbierto ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {menuAbierto && (
          <nav className="flex flex-col gap-4 border-t border-[#E5E0D8] bg-white p-6 md:hidden">
            {enlaces.map(([nombre, ruta]) => (
              <Link
                key={ruta}
                to={ruta}
                onClick={() => setMenuAbierto(false)}
              >
                {nombre}
              </Link>
            ))}

            <hr />

            <Link
              to="/favoritos"
              onClick={() => setMenuAbierto(false)}
            >
              Mis favoritos
            </Link>

            {usuario ? (
              <>
                <Link
                  to="/perfil"
                  onClick={() => setMenuAbierto(false)}
                >
                  Mi perfil - {usuario.nombre}
                </Link>

                {esAdmin && (
                  <Link
                    to="/admin/resenas"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Administrar reseñas
                  </Link>
                )}

                <button
                  onClick={cerrarSesion}
                  className="text-left text-red-700"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuAbierto(false)}
                >
                  Iniciar sesión
                </Link>

                <Link
                  to="/registro"
                  onClick={() => setMenuAbierto(false)}
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        )}
      </header>

      <main className="w-full">
        <Outlet />
      </main>

      <footer className="border-t border-[#E5E0D8] bg-[#EAE6DF] px-6 py-10 lg:px-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row">
          <div>
            <h2 className="text-xl font-black">
              URBAN<span className="text-[#766B5D]">STEP.</span>
            </h2>
            <p className="mt-2 text-sm text-[#77716A]">
              Tu estilo, tu camino.
            </p>
          </div>

          <p className="text-sm text-[#77716A]">
            © 2026 UrbanStep. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
