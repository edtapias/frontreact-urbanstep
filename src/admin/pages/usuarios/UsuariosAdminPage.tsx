
import { useState } from "react";
import { Search, Users, RefreshCw } from "lucide-react";
import { useUsuarios } from "../../../hooks/useUsuarios";
export default function UsuariosAdminPage() {
  const {
    usuarios,
    cargando,
    error,
    buscarUsuarios,
    cargarUsuarios,
  } = useUsuarios();

  const [busqueda, setBusqueda] = useState("");

  const buscar = () => {
    buscarUsuarios(busqueda);
  };

  return (
    <div className="space-y-8">

      <div>
        <h2 className="text-3xl font-black">Usuarios</h2>
        <p className="mt-2 text-sm text-[#91897F]">
          Administra las cuentas registradas en UrbanStep.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="text-[#766B5D]" size={25} />
            <span className="text-sm text-[#91897F]">
              Total de usuarios
            </span>
          </div>

          <p className="mt-4 text-3xl font-black">
            {usuarios.length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border px-4">
            <Search size={20} className="text-gray-400" />

            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") buscar();
              }}
              placeholder="Buscar por nombre, correo o RUT..."
              className="w-full py-3 outline-none"
            />
          </div>

          <button
            onClick={buscar}
            className="rounded-xl bg-[#393632] px-6 py-3 text-white"
          >
            Buscar
          </button>

          <button
            onClick={() => {
              setBusqueda("");
              cargarUsuarios();
            }}
            className="flex items-center justify-center gap-2 rounded-xl border px-5 py-3"
          >
            <RefreshCw size={17} />
            Actualizar
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {cargando ? (
          <p className="py-10 text-center text-gray-500">
            Cargando usuarios...
          </p>
        ) : usuarios.length === 0 ? (
          <p className="py-10 text-center text-gray-500">
            No se encontraron usuarios.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-[#91897F]">
                  <th className="p-4">RUT</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Correo</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario, index) => (
                  <tr
                    key={usuario.id ?? usuario.rut ?? index}
                    className="border-b last:border-0"
                  >
                    <td className="p-4">{usuario.rut}</td>
                    <td className="p-4 font-semibold">
                      {usuario.nombre}
                    </td>
                    <td className="p-4">{usuario.correo}</td>
                    <td className="p-4">
                      {usuario.rol ?? "Cliente"}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        {usuario.activo === false
                          ? "Inactivo"
                          : "Activo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
