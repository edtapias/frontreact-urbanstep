
import { BrowserRouter, Routes, Route } from "react-router";

import ClientLayout from "../client/layout/ClientLayout";
import HomePage from "../client/pages/home/HomePage";
import CatalogoPage from "../client/pages/catalogo/CatalogoPage";
import MisFavoritosPage from "../client/pages/favoritos/MisFavoritosPage";
import CarritoPage from "../client/pages/carrito/CarritoPage";
import PagoPage from "../client/pages/pagos/PagosPage";
import SoportePage from "../client/pages/soporte/SoportePage";

import AdminLayout from "../admin/layout/AdminLayout";
import AdminPage from "../admin/pages/AdminPage";
import InventarioPage from "../admin/pages/InventarioPage";
import ProductosPage from "../admin/pages/productos/ProductosPage";
import AdminPedidosPage from "../admin/pages/AdminPedidosPage";
import AdminResenasPage from "../admin/pages/AdminResenasPage";
import AdminEnviosPage from "../admin/pages/envios/AdminEnviosPage";
import ReportesPage from "../admin/pages/ReportesPage";

import LoginPage from "../client/pages/usuarios/LoginPage";
import RegisterPage from "../client/pages/usuarios/RegisterPage";
import PerfilPage from "../client/pages/usuarios/PerfilPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* TIENDA CLIENTE */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogoPage />} />
          <Route path="favoritos" element={<MisFavoritosPage />} />
          <Route path="carrito" element={<CarritoPage />} />
          <Route path="pago" element={<PagoPage />} />
          <Route path="soporte" element={<SoportePage />} />
        </Route>

        {/* USUARIOS */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/perfil" element={<PerfilPage />} />

        {/* PANEL ADMINISTRADOR */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPage />} />
          <Route path="productos" element={<ProductosPage />} />
          <Route path="inventario" element={<InventarioPage />} />
          <Route path="pedidos" element={<AdminPedidosPage />} />
          <Route path="envios" element={<AdminEnviosPage />} />
          <Route path="resenas" element={<AdminResenasPage />} />
          <Route path="reportes" element={<ReportesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
