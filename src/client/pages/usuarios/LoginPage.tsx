
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { LogIn, ArrowLeft, Eye, EyeOff } from "lucide-react";
import UsuariosService from "../../../services/UsuariosService";

export default function LoginPage() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const iniciarSesion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      setCargando(true);

      const usuario = await UsuariosService.iniciarSesion({
        correo,
        password,
      });

      console.log("Usuario recibido:", usuario);
      console.log("Rol recibido:", usuario.rol);

      // Normalizar el rol recibido
      const rol = usuario.rol?.trim().toUpperCase();

      // Guardar sesión
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Redirigir según el tipo de usuario
      if (rol === "ADMIN" || rol === "ADMINISTRADOR") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (err: any) {
      console.error("Error al iniciar sesión:", err);

      setError(
        err.response?.data?.message ||
        "Correo o contraseña incorrectos."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F3EF] px-4 py-10">
      <div className="mx-auto max-w-md">

        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#77716A] hover:text-[#393632]"
        >
          <ArrowLeft size={18} />
          Volver a la tienda
        </Link>

        <section className="rounded-2xl bg-white p-8 shadow-sm">

          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E5E0D8]">
              <LogIn size={26} className="text-[#766B5D]" />
            </div>

            <h1 className="text-2xl font-bold text-[#393632]">
              Bienvenido a UrbanStep
            </h1>

            <p className="mt-2 text-sm text-[#77716A]">
              Ingresa a tu cuenta para continuar.
            </p>
          </div>

          <form onSubmit={iniciarSesion} className="space-y-5">

            <div>
              <label className="mb-1 block text-sm font-medium">
                Correo electrónico
              </label>

              <input
                required
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full rounded-lg border border-[#E5E0D8] px-4 py-3 outline-none focus:border-[#766B5D]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Contraseña
              </label>

              <div className="relative">
                <input
                  required
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full rounded-lg border border-[#E5E0D8] px-4 py-3 pr-12 outline-none focus:border-[#766B5D]"
                />

                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-3 text-[#77716A]"
                  aria-label="Mostrar u ocultar contraseña"
                >
                  {mostrarPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-lg bg-[#393632] py-3 font-semibold text-white transition hover:bg-[#766B5D] disabled:opacity-50"
            >
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-[#77716A]">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/registro"
              className="font-semibold text-[#766B5D] hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>

        </section>
      </div>
    </main>
  );
}
