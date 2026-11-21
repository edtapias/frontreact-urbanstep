
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      // API Gateway - Usuarios
      "/api/usuarios": {
        target: "http://localhost:8088",
        changeOrigin: true,
      },

      // API Gateway - Pagos
      "/api/pagos": {
        target: "http://localhost:8088",
        changeOrigin: true,
      },

      // API Gateway - Carrito
      "/api/carrito": {
        target: "http://localhost:8088",
        changeOrigin: true,
      },

      // API Gateway - Pedidos
      "/api/pedidos": {
        target: "http://localhost:8088",
        changeOrigin: true,
      },

      // Microservicio de reseñas
      "/api/resenas": {
        target: "http://localhost:8091",
        changeOrigin: true,
      },

      // API Gateway 
      "/api": {
        target: "http://localhost:8088",
        changeOrigin: true,
      },
    },
  },
});
