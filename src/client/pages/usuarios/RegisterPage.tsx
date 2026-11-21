
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { UserPlus, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import UsuariosService from "../../../services/UsuariosService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", rut: "", correo: "", password: "" });
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cambiar = (campo: string, valor: string) =>
    setForm({ ...form, [campo]: valor });

  const formatearRut = (valor: string) => {
    const limpio = valor.replace(/[^0-9kK]/g, "").toUpperCase();
    return limpio.length > 1
      ? `${limpio.slice(0, -1)}-${limpio.slice(-1)}`
      : limpio;
  };

  const validarRut = (rut: string) => {
    const limpio = rut.replace(/[^0-9K]/g, "");
    if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false;

    let suma = 0, factor = 2;
    for (let i = limpio.length - 2; i >= 0; i--) {
      suma += Number(limpio[i]) * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }

    const resultado = 11 - (suma % 11);
    const dv = resultado === 11 ? "0" : resultado === 10 ? "K" : String(resultado);
    return limpio.slice(-1) === dv;
  };

  const registrar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setExito("");

    const datos = {
      nombre: form.nombre.trim(),
      rut: form.rut.replace(/[^0-9K]/g, ""),
      correo: form.correo.trim().toLowerCase(),
      password: form.password
    };

    if (!datos.nombre) return setError("Ingresa tu nombre completo.");
    if (!validarRut(datos.rut)) return setError("El RUT ingresado no es válido.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo))
      return setError("Ingresa un correo electrónico válido.");
    if (datos.password.length < 8)
      return setError("La contraseña debe tener al menos 8 caracteres.");

    try {
      setCargando(true);
      await UsuariosService.registrar(datos);
      setExito("¡Cuenta creada correctamente! Redirigiendo al inicio de sesión...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      const respuesta = err.response?.data;
      setError(
        typeof respuesta === "string"
          ? respuesta
          : respuesta?.message || respuesta?.detail ||
            "No se pudo crear la cuenta. Comprueba si el RUT o correo ya están registrados."
      );
    } finally {
      setCargando(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-[#E5E0D8] px-4 py-3 outline-none transition focus:border-[#766B5D]";

  return (
    <main className="min-h-screen bg-[#F5F3EF] px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[#77716A] hover:text-[#393632]">
          <ArrowLeft size={18} /> Volver a la tienda
        </Link>

        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E5E0D8]">
              <UserPlus size={26} className="text-[#766B5D]" />
            </div>
            <h1 className="text-2xl font-bold text-[#393632]">Crea tu cuenta</h1>
            <p className="mt-2 text-sm text-[#77716A]">
              Únete a UrbanStep y encuentra tus zapatillas favoritas.
            </p>
          </div>

          <form onSubmit={registrar} className="space-y-4">
            {[
              { campo: "nombre", titulo: "Nombre completo", tipo: "text", placeholder: "Ingresa tu nombre" },
              { campo: "rut", titulo: "RUT", tipo: "text", placeholder: "12345678-9" },
              { campo: "correo", titulo: "Correo electrónico", tipo: "email", placeholder: "correo@ejemplo.com" }
            ].map(({ campo, titulo, tipo, placeholder }) => (
              <div key={campo}>
                <label className="mb-1 block text-sm font-medium">{titulo}</label>
                <input
                  required
                  type={tipo}
                  value={form[campo as keyof typeof form]}
                  onChange={e => cambiar(campo, campo === "rut" ? formatearRut(e.target.value) : e.target.value)}
                  placeholder={placeholder}
                  maxLength={campo === "rut" ? 10 : undefined}
                  className={inputClass}
                />
                {campo === "rut" && (
                  <p className="mt-1 text-xs text-[#77716A]">
                    Ingresa tu RUT sin puntos. Ejemplo: 12345678-9.
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="mb-1 block text-sm font-medium">Contraseña</label>
              <div className="relative">
                <input
                  required
                  minLength={8}
                  type={mostrar ? "text" : "password"}
                  value={form.password}
                  onChange={e => cambiar("password", e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={`${inputClass} pr-12`}
                />
                <button type="button" onClick={() => setMostrar(!mostrar)} className="absolute right-3 top-3 text-[#77716A]" aria-label="Mostrar u ocultar contraseña">
                  {mostrar ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {exito && (
              <p className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle2 size={18} /> {exito}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-lg bg-[#393632] py-3 font-semibold text-white transition hover:bg-[#766B5D] disabled:opacity-50"
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#77716A]">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="font-semibold text-[#766B5D] hover:underline">
              Inicia sesión
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
