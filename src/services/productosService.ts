
import axios from "axios";

// Estructura de una categoría
export interface Categoria {
  id: number;
  nombre: string;
}

// Estructura de una zapatilla
export interface Producto {
  id: number;
  nombre: string;
  marca: string;
  color: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  talla: string;
  destacado: boolean;
  categoria: Categoria;
}

// Datos que se envían al backend
export interface ProductoPayload {
  nombre: string;
  marca: string;
  color: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  talla: string;
  destacado: boolean;
  categoria: Categoria;
}

// Configuración de la API
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// Interceptor para mostrar errores completos
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    console.error("=================================");
    console.error("ERROR EN API DE CATÁLOGO");
    console.error("=================================");

    console.error(
      "URL:",
      error.config?.baseURL + error.config?.url
    );

    console.error(
      "Método:",
      error.config?.method?.toUpperCase()
    );

    console.error(
      "Estado HTTP:",
      error.response?.status
    );

    console.error(
      "Respuesta del backend:",
      error.response?.data
    );

    // Mostrar la respuesta como JSON legible
    try {
      console.error(
        "RESPUESTA JSON:",
        JSON.stringify(
          error.response?.data,
          null,
          2
        )
      );
    } catch {
      console.error(
        "No se pudo convertir la respuesta del backend a JSON."
      );
    }

    // Mostrar los datos enviados
    console.error(
      "Datos enviados:",
      error.config?.data
    );

    // Mostrar los datos enviados como JSON
    try {
      if (error.config?.data) {
        const datosEnviados =
          typeof error.config.data === "string"
            ? JSON.parse(error.config.data)
            : error.config.data;

        console.error(
          "DATOS ENVIADOS JSON:",
          JSON.stringify(
            datosEnviados,
            null,
            2
          )
        );
      }
    } catch {
      console.error(
        "No se pudieron convertir los datos enviados a JSON."
      );
    }

    console.error(
      "Mensaje:",
      error.message
    );

    console.error("=================================");

    return Promise.reject(error);
  }
);

// Endpoint de zapatillas
const RESOURCE = "/zapatillas";

// Servicio CRUD
const ProductosService = {

  // ==========================================
  // LISTAR ZAPATILLAS
  // ==========================================
  async listar(): Promise<Producto[]> {
    const { data } =
      await apiClient.get<Producto[]>(
        RESOURCE
      );

    if (!Array.isArray(data)) {
      throw new Error(
        "El backend no devolvió una lista de productos."
      );
    }

    return data;
  },

  // ==========================================
  // OBTENER ZAPATILLA POR ID
  // ==========================================
  async obtener(
    id: number
  ): Promise<Producto> {

    const { data } =
      await apiClient.get<Producto>(
        `${RESOURCE}/${id}`
      );

    return data;
  },

  // ==========================================
  // CREAR ZAPATILLA
  // ==========================================
  async crear(
    producto: ProductoPayload
  ): Promise<Producto> {

    console.log("=================================");
    console.log("CREANDO ZAPATILLA");
    console.log("=================================");

    console.log(
      "JSON enviado al catálogo:"
    );

    console.log(
      JSON.stringify(
        producto,
        null,
        2
      )
    );

    try {

      const { data } =
        await apiClient.post<Producto>(
          RESOURCE,
          producto
        );

      console.log(
        "Zapatilla creada correctamente:"
      );

      console.log(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      return data;

    } catch (error) {

      console.error(
        "No se pudo crear la zapatilla."
      );

      throw error;
    }
  },

  // ==========================================
  // ACTUALIZAR ZAPATILLA
  // ==========================================
  async actualizar(
    id: number,
    producto: ProductoPayload
  ): Promise<Producto> {

    console.log("=================================");
    console.log("ACTUALIZANDO ZAPATILLA");
    console.log("=================================");

    console.log(
      "ID:",
      id
    );

    console.log(
      "JSON enviado al catálogo:"
    );

    console.log(
      JSON.stringify(
        producto,
        null,
        2
      )
    );

    try {

      const { data } =
        await apiClient.put<Producto>(
          `${RESOURCE}/${id}`,
          producto
        );

      console.log(
        "Zapatilla actualizada correctamente:"
      );

      console.log(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      return data;

    } catch (error) {

      console.error(
        "No se pudo actualizar la zapatilla."
      );

      throw error;
    }
  },

  // ==========================================
  // ELIMINAR ZAPATILLA
  // ==========================================
  async eliminar(
    id: number
  ): Promise<void> {

    console.log(
      "Eliminando zapatilla:",
      id
    );

    await apiClient.delete(
      `${RESOURCE}/${id}`
    );
  },
};

export default ProductosService;
