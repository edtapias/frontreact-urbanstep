import { crearClienteApi } from "../lib/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

const inventarioApi = crearClienteApi(API_BASE_URL);

export interface RegistroInventario {
  id?: number;
  zapatillaId: number;
  talla: string;
  cantidadDisponible: number;
  sucursal?: string;
  umbralMinimo?: number;
}

export interface MovimientoInventario {
  id?: number;
  tipoMovimiento: "ENTRADA" | "SALIDA";
  cantidad: number;
  fechaMovimiento?: string;
  observacion?: string;
}

// Alias para mantener compatibilidad si algún componente importa `Inventario`
export type Inventario = RegistroInventario;

const normalizarTalla = (talla: string): string =>
  String(talla ?? "").trim().toLowerCase();

const InventarioService = {
  async listar(): Promise<RegistroInventario[]> {
    const { data } = await inventarioApi.get<RegistroInventario[]>(
      "/inventario"
    );
    return Array.isArray(data) ? data : [];
  },

  async listarPorZapatilla(
    zapatillaId: number
  ): Promise<RegistroInventario[]> {
    const { data } = await inventarioApi.get<RegistroInventario[]>(
      `/inventario/zapatilla/${zapatillaId}`
    );
    return Array.isArray(data) ? data : [];
  },

  async consultarPorZapatilla(
    zapatillaId: number
  ): Promise<RegistroInventario[]> {
    return this.listarPorZapatilla(zapatillaId);
  },

  async registrarTalla(
    payload: RegistroInventario
  ): Promise<RegistroInventario> {
    const { data } = await inventarioApi.post<RegistroInventario>(
      "/inventario",
      {
        zapatillaId: payload.zapatillaId,
        talla: payload.talla.trim(),
        cantidadDisponible: payload.cantidadDisponible,
        sucursal: payload.sucursal ?? "Bodega Central",
      }
    );
    return data;
  },

  async consultarHistorial(
    inventarioId: number
  ): Promise<MovimientoInventario[]> {
    const { data } = await inventarioApi.get<MovimientoInventario[]>(
      `/inventario/${inventarioId}/historial`
    );
    return Array.isArray(data) ? data : [];
  },

  async registrarMovimiento(
    inventarioId: number,
    tipoMovimiento: "ENTRADA" | "SALIDA",
    cantidad: number,
    observacion?: string
  ): Promise<RegistroInventario> {
    const { data } = await inventarioApi.post<RegistroInventario>(
      `/inventario/${inventarioId}/movimiento`,
      {
        tipoMovimiento,
        cantidad,
        observacion,
      }
    );
    return data;
  },

  // Registra la talla si no existe para esa zapatilla, o ajusta el stock si ya existe
  async actualizarStock(
    zapatillaId: number,
    talla: string,
    cantidadObjetivo: number
  ): Promise<RegistroInventario> {
    const tallaLimpia = talla.trim();
    const registros = await this.listarPorZapatilla(zapatillaId);

    const existente = registros.find(
      (item) => normalizarTalla(item.talla) === normalizarTalla(tallaLimpia)
    );

    if (!existente || !existente.id) {
      return this.registrarTalla({
        zapatillaId,
        talla: tallaLimpia,
        cantidadDisponible: cantidadObjetivo,
        sucursal: "Bodega Central",
      });
    }

    const actual = Number(existente.cantidadDisponible ?? 0);
    const diferencia = cantidadObjetivo - actual;

    if (diferencia > 0) {
      return this.registrarMovimiento(
        existente.id,
        "ENTRADA",
        diferencia,
        "Actualización de stock desde gestión de productos"
      );
    }

    if (diferencia < 0) {
      return this.registrarMovimiento(
        existente.id,
        "SALIDA",
        Math.abs(diferencia),
        "Ajuste de stock desde gestión de productos"
      );
    }

    return existente;
  },
};

export default InventarioService;