
import axios from "axios";

const carritoApi = axios.create({
  baseURL: "/api/carrito",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// Consulta los productos en el microservicio de catálogo (puerto 8080)
const catalogoApi = axios.create({
  baseURL: "/api",
  headers: {
    Accept: "application/json",
  },
  timeout: 15000,
});

export interface ItemCarrito {
  id: number;
  productoId: number;
  nombreProducto: string;
  talla: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  imagenUrl?: string;
  imagen?: string;
  urlImagen?: string;
}

export interface Carrito {
  id: number;
  clienteId: number;
  items: ItemCarrito[];
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  fechaCreacion: string;
}

export interface AgregarItemDTO {
  productoId: number;
  talla: string;
  cantidad: number;
}

// Busca la imagen de cada producto en el catálogo
const agregarImagenes = async (carrito: Carrito): Promise<Carrito> => {
  if (!carrito || !Array.isArray(carrito.items)) {
    return carrito;
  }

  const itemsActualizados = await Promise.all(
    carrito.items.map(async (item) => {
      try {
        const respuesta = await catalogoApi.get(
          `/zapatillas/${item.productoId}`
        );

        // Algunos servicios devuelven el producto directamente
        // y otros lo incluyen dentro de una propiedad "data".
        const producto = respuesta.data?.data ?? respuesta.data;

        return {
          ...item,
          nombreProducto:
            item.nombreProducto || producto.nombre || "Zapatilla",
          imagenUrl:
            producto.imagenUrl ||
            producto.imagen ||
            producto.urlImagen ||
            item.imagenUrl ||
            item.imagen ||
            item.urlImagen ||
            "",
        };
      } catch (error) {
        console.error(
          `No se pudo obtener la imagen del producto ${item.productoId}:`,
          error
        );

        // Si falla el catálogo, conservamos los datos del carrito.
        return item;
      }
    })
  );

  return {
    ...carrito,
    items: itemsActualizados,
  };
};

const CarritoService = {
  obtener: async (clienteId: number): Promise<Carrito> => {
    const respuesta = await carritoApi.get(`/${clienteId}`);
    return agregarImagenes(respuesta.data);
  },

  agregar: async (
    clienteId: number,
    datos: AgregarItemDTO
  ): Promise<Carrito> => {
    const respuesta = await carritoApi.post(`/${clienteId}/items`, datos);
    return agregarImagenes(respuesta.data);
  },

  eliminar: async (clienteId: number, itemId: number): Promise<void> => {
    await carritoApi.delete(`/${clienteId}/items/${itemId}`);
  },

  actualizarCantidad: async (
    clienteId: number,
    itemId: number,
    cantidad: number
  ): Promise<Carrito> => {
    const respuesta = await carritoApi.put(
      `/${clienteId}/items/${itemId}/cantidad`,
      { cantidad }
    );

    return agregarImagenes(respuesta.data);
  },

  actualizarTalla: async (
    clienteId: number,
    itemId: number,
    talla: string
  ): Promise<Carrito> => {
    const respuesta = await carritoApi.put(
      `/${clienteId}/items/${itemId}/talla`,
      { talla }
    );

    return agregarImagenes(respuesta.data);
  },

  vaciar: async (clienteId: number): Promise<void> => {
    await carritoApi.delete(`/${clienteId}/vaciar`);
  },
};

export default CarritoService;
