
import { Link, Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, Package, ShoppingCart,
  BarChart3, LogOut, Warehouse, MessageSquare, Truck
} from "lucide-react";

const opciones = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Productos", "/admin/productos", Package],
  ["Inventario", "/admin/inventario", Warehouse],
  ["Pedidos", "/admin/pedidos", ShoppingCart],
  ["Envíos", "/admin/envios", Truck],
  ["Reseñas", "/admin/resenas", MessageSquare],
  ["Reportes", "/admin/reportes", BarChart3],
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#393632]">

      <aside className="hidden w-64 shrink-0 bg-white border-r p-6 md:flex md:flex-col">
        <Link to="/" className="text-2xl font-black">
          URBAN<span className="text-[#766B5D]">STEP.</span>
        </Link>

        <p className="my-8 text-xs tracking-widest text-[#91897F]">
          PANEL ADMINISTRATIVO
        </p>

        <nav className="space-y-2">
          {opciones.map(([nombre, ruta, Icon]) => {
            const activo = location.pathname === ruta ||
              (ruta !== "/admin" && location.pathname.startsWith(ruta + "/"));

            return (
              <Link
                key={ruta as string}
                to={ruta as string}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                  activo ? "bg-[#EAE6DF] font-bold" : "text-[#77716A] hover:bg-[#F0EDE8]"
                }`}
              >
                <Icon size={20} />
                {nombre as string}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("usuario");
            navigate("/login");
          }}
          className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#77716A] hover:text-red-600"
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b bg-white px-6 py-5 md:px-10">
          <div>
            <h1 className="font-bold">Panel administrativo</h1>
            <p className="text-xs text-[#91897F]">Administración UrbanStep</p>
          </div>
          <span className="rounded-full bg-[#EAE6DF] px-4 py-2 text-xs font-bold">
            ADMINISTRADOR
          </span>
        </header>

        <main className="p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
