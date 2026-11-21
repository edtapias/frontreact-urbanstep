
import axios from "axios";

// Conexión con el microservicio de inventario.
const inventarioApi = axios.create({
  baseURL: "/api/inventario",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// Estructura del inventario.
export interface Inventario {
  id: number;
  zapatillaId: number;
  talla: string;
  sucursal: string;
  cantidadDisponible: number;
  umbralMinimo: number;
  ultimaActualizacion: string;
}

// Estructura de los movimientos.
export interface MovimientoInventario {
  id: number;
  cantidad: number;
  fechaMovimiento: string;
  observacion: string;
  tipoMovimiento: "ENTRADA" | "SALIDA";
}

// Datos para registrar movimientos.
export interface RegistrarMovimientoDTO {
  tipoMovimiento: "ENTRADA" | "SALIDA";
  cantidad: number;
  observacion: string;
}

const InventarioService = {

  // =====================================================
  // LISTAR TODOS LOS REGISTROS DE INVENTARIO
  // =====================================================
  listar: async (): Promise<Inventario[]> => {
    try {
      const respuesta = await inventarioApi.get("");

      const datos = respuesta.data;

      if (Array.isArray(datos)) {
        return datos;
      }

      if (Array.isArray(datos?.content)) {
        return datos.content;
      }

      console.error("Formato de inventario inesperado:", datos);

      throw new Error(
        "El backend no devolvió una lista de inventario."
      );

    } catch (error) {
      console.error("Error al listar inventario:", error);
      throw error;
    }
  },

  // =====================================================
  // CONSULTAR INVENTARIO DE UNA ZAPATILLA
  // =====================================================
  consultarPorZapatilla: async (
    zapatillaId: number
  ): Promise<Inventario[]> => {
    try {
      const respuesta = await inventarioApi.get(
        `/zapatilla/${zapatillaId}`
      );

      return respuesta.data;

    } catch (error) {
      console.error("Error al consultar inventario:", error);
      throw error;
    }
  },

  // =====================================================
  // CONSULTAR INVENTARIO CRÍTICO
  // =====================================================
  consultarCritico: async (): Promise<Inventario[]> => {
    try {
      const respuesta = await inventarioApi.get("/critico");

      return respuesta.data;

    } catch (error) {
      console.error("Error al consultar stock crítico:", error);
      throw error;
    }
  },

  // =====================================================
  // REGISTRAR ENTRADA O SALIDA DE STOCK
  // =====================================================
  registrarMovimiento: async (
    inventarioId: number,
    datos: RegistrarMovimientoDTO
  ): Promise<Inventario> => {
    try {
      const respuesta = await inventarioApi.post(
        `/${inventarioId}/movimiento`,
        datos
      );

      return respuesta.data;

    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      throw error;
    }
  },

  // =====================================================
  // CONSULTAR HISTORIAL DE MOVIMIENTOS
  // =====================================================
  consultarHistorial: async (
    inventarioId: number
  ): Promise<MovimientoInventario[]> => {
    try {
      const respuesta = await inventarioApi.get(
        `/${inventarioId}/historial`
      );

      return respuesta.data;

    } catch (error) {
      console.error("Error al consultar historial:", error);
      throw error;
    }
  },

  // =====================================================
  // ACTUALIZAR STOCK A UNA CANTIDAD DETERMINADA
  // =====================================================
  actualizarStock: async (
    zapatillaId: number,
    talla: string,
    nuevoStock: number
  ): Promise<Inventario> => {
    try {

      // Validar cantidad.
      if (
        !Number.isInteger(nuevoStock) ||
        nuevoStock < 0
      ) {
        throw new Error(
          "El stock debe ser un número entero mayor o igual a cero."
        );
      }

      // Consultar los registros de la zapatilla.
      const registros =
        await InventarioService.consultarPorZapatilla(
          zapatillaId
        );

      // Buscar el registro correspondiente a la talla y sucursal.
      const inventario = registros.find(
        (item) =>
          String(item.talla).trim().toLowerCase() ===
            String(talla).trim().toLowerCase() &&
          item.sucursal === "Bodega Central"
      );

      // Si no existe, crear el registro.
      if (!inventario) {
        const respuesta = await inventarioApi.post("", {
          zapatillaId,
          talla,
          sucursal: "Bodega Central",
          cantidadDisponible: nuevoStock,
          umbralMinimo: 5,
        });

        return respuesta.data;
      }

      // Calcular diferencia entre stock actual y nuevo.
      const stockActual = Number(
        inventario.cantidadDisponible || 0
      );

      const diferencia = nuevoStock - stockActual;

      // Si no hay cambios, devolver el inventario actual.
      if (diferencia === 0) {
        return inventario;
      }

      // Registrar entrada o salida según corresponda.
      const movimiento: RegistrarMovimientoDTO = {
        tipoMovimiento:
          diferencia > 0 ? "ENTRADA" : "SALIDA",

        cantidad: Math.abs(diferencia),

        observacion:
          "Actualización de stock desde gestión de productos",
      };

      return await InventarioService.registrarMovimiento(
        inventario.id,
        movimiento
      );

    } catch (error) {
      console.error("Error al actualizar stock:", error);
      throw error;
    }
  },

};

export default InventarioService;
