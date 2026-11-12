import { useCallback, useEffect, useState } from "react";

import ProductosService from "../services/productosService";

import type {
  Producto,
  ProductoPayload,
} from "../services/productosService";

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // LISTAR PRODUCTOS
  const listar = useCallback(async () => {
    try {
      setCargando(true);
      setError("");
      const datos = await ProductosService.listar();
      setProductos(datos);
      return datos;
    } catch (err) {
      console.error("Error al obtener productos:", err);
      setError("No se pudieron cargar los productos.");
      return [];
    } finally {
      setCargando(false);
    }
  }, []);

  // CREAR PRODUCTO: devuelve el producto completo para obtener su ID.
  const crear = async (producto: ProductoPayload): Promise<Producto | null> => {
    try {
      setError("");
      const nuevoProducto = await ProductosService.crear(producto);
      setProductos((actuales) => [...actuales, nuevoProducto]);
      return nuevoProducto;
    } catch (err) {
      console.error("Error al crear producto:", err);
      setError("No se pudo registrar el producto.");
      return null;
    }
  };

  // ACTUALIZAR PRODUCTO
  const actualizar = async (
    id: number,
    producto: ProductoPayload
  ): Promise<boolean> => {
    try {
      setError("");
      const productoActualizado = await ProductosService.actualizar(id, producto);
      setProductos((actuales) =>
        actuales.map((item) => item.id === id ? productoActualizado : item)
      );
      return true;
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      setError("No se pudo actualizar el producto.");
      return false;
    }
  };

  // ELIMINAR PRODUCTO
  const eliminar = async (id: number): Promise<boolean> => {
    try {
      setError("");
      await ProductosService.eliminar(id);
      setProductos((actuales) => actuales.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      setError("No se pudo eliminar el producto.");
      return false;
    }
  };

  useEffect(() => {
    listar();
  }, [listar]);

  return { productos, cargando, error, listar, crear, actualizar, eliminar };
}

export default useProductos;
