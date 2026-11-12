
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import useProductos from "../../../hooks/useProductos";

import type {
  Producto,
  ProductoPayload,
} from "../../../services/productosService";

import InventarioService, {
  type Inventario,
} from "../../../services/InventarioService";

type TallaStock = {
  talla: string;
  stock: number;
};

const formularioInicial: ProductoPayload = {
  nombre: "",
  marca: "",
  color: "",
  precio: 0,
  stock: 0,
  imagenUrl: "",
  talla: "",
  destacado: false,
  categoria: {
    id: 1,
    nombre: "",
  },
};

export default function ProductosPage() {
  const {
    productos,
    cargando,
    error,
    crear,
    actualizar,
    eliminar,
  } = useProductos();

  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [cargandoInventario, setCargandoInventario] = useState(true);
  const [errorInventario, setErrorInventario] = useState("");

  const [formulario, setFormulario] =
    useState<ProductoPayload>(formularioInicial);

  const [tallas, setTallas] = useState<TallaStock[]>([
    { talla: "", stock: 0 },
  ]);

  const [productoEditando, setProductoEditando] =
    useState<number | null>(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Cargar inventario
  const cargarInventario = useCallback(async () => {
    try {
      setErrorInventario("");

      const datos = await InventarioService.listar();
      setInventario(datos);
    } catch (err) {
      console.error("Error al cargar inventario:", err);

      setErrorInventario(
        "No se pudo actualizar el stock real del inventario."
      );
    } finally {
      setCargandoInventario(false);
    }
  }, []);

  useEffect(() => {
    cargarInventario();

    const intervalo = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        cargarInventario();
      }
    }, 5000);

    const actualizarAlVolver = () => {
      if (document.visibilityState === "visible") {
        cargarInventario();
      }
    };

    document.addEventListener("visibilitychange", actualizarAlVolver);

    return () => {
      window.clearInterval(intervalo);

      document.removeEventListener(
        "visibilitychange",
        actualizarAlVolver
      );
    };
  }, [cargarInventario]);

  // Obtener stock real de una zapatilla
  const obtenerStockReal = (zapatillaId: number): number => {
    return inventario
      .filter((item) => item.zapatillaId === zapatillaId)
      .reduce(
        (total, item) =>
          total + Number(item.cantidadDisponible || 0),
        0
      );
  };

  // Stock total del formulario
  const stockTotal = tallas.reduce(
    (total, item) => total + Number(item.stock || 0),
    0
  );

  // Modificar campos del formulario
  const cambiarCampo = (
    campo: keyof ProductoPayload,
    valor: string | number | boolean
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  // Modificar una talla
  const cambiarTalla = (
    indice: number,
    campo: keyof TallaStock,
    valor: string | number
  ) => {
    setTallas((actual) =>
      actual.map((item, i) =>
        i === indice
          ? { ...item, [campo]: valor }
          : item
      )
    );
  };

  // Agregar otra talla
  const agregarTalla = () => {
    setTallas((actual) => [
      ...actual,
      { talla: "", stock: 0 },
    ]);
  };

  // Eliminar talla
  const eliminarTalla = (indice: number) => {
    if (tallas.length === 1) {
      alert("Debes mantener al menos una talla.");
      return;
    }

    setTallas((actual) =>
      actual.filter((_, i) => i !== indice)
    );
  };

  // Cerrar y limpiar formulario
  const limpiarFormulario = () => {
    setFormulario({
      ...formularioInicial,
      categoria: { ...formularioInicial.categoria },
    });

    setTallas([{ talla: "", stock: 0 }]);
    setProductoEditando(null);
    setMostrarFormulario(false);
  };

  // Editar producto
  const editarProducto = (producto: Producto) => {
    setFormulario({
      nombre: producto.nombre,
      marca: producto.marca,
      color: producto.color,
      precio: producto.precio,
      stock: obtenerStockReal(producto.id),
      imagenUrl: producto.imagenUrl || "",
      talla: producto.talla,
      destacado: producto.destacado ?? false,
      categoria: {
        id: producto.categoria.id,
        nombre: producto.categoria.nombre,
      },
    });

    setTallas([
      {
        talla: producto.talla,
        stock: obtenerStockReal(producto.id),
      },
    ]);

    setProductoEditando(producto.id);
    setMostrarFormulario(true);
  };

  // Guardar productos y sincronizar inventario
  const guardarProducto = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (tallas.length === 0) {
      alert("Debes ingresar al menos una talla.");
      return;
    }

    const tallasNormalizadas = tallas.map((item) => ({
      talla: item.talla.trim(),
      stock: Number(item.stock),
    }));

    if (tallasNormalizadas.some((item) => !item.talla)) {
      alert("Debes completar todas las tallas.");
      return;
    }

    if (
      tallasNormalizadas.some(
        (item) =>
          !Number.isInteger(item.stock) ||
          !Number.isFinite(item.stock) ||
          item.stock < 0
      )
    ) {
      alert("El stock debe ser un número entero mayor o igual a cero.");
      return;
    }

    const tallasUnicas = tallasNormalizadas.map((item) =>
      item.talla.toLowerCase()
    );

    if (new Set(tallasUnicas).size !== tallasUnicas.length) {
      alert("No puedes ingresar la misma talla más de una vez.");
      return;
    }

    if (
      !formulario.nombre.trim() ||
      !formulario.marca.trim() ||
      !formulario.imagenUrl.trim()
    ) {
      alert("Completa el nombre, la marca y la imagen del producto.");
      return;
    }

    if (
      !Number.isFinite(Number(formulario.precio)) ||
      Number(formulario.precio) <= 0
    ) {
      alert("El precio debe ser mayor que cero.");
      return;
    }

    if (
      !Number.isInteger(Number(formulario.categoria.id)) ||
      Number(formulario.categoria.id) <= 0
    ) {
      alert("Ingresa un ID de categoría válido.");
      return;
    }

    setGuardando(true);

    try {
      for (let i = 0; i < tallasNormalizadas.length; i++) {
        const variante = tallasNormalizadas[i];

        // Payload con la misma estructura del catálogo original
        const payload: ProductoPayload = {
          nombre: formulario.nombre.trim(),
          marca: formulario.marca.trim(),
          color: formulario.color.trim(),
          precio: Number(formulario.precio),
          stock: variante.stock,
          imagenUrl: formulario.imagenUrl.trim(),
          talla: variante.talla,
          destacado: Boolean(formulario.destacado),
          categoria: {
            id: Number(formulario.categoria.id),
            nombre: formulario.categoria.nombre,
          },
        };

        let zapatillaId: number;

        if (productoEditando !== null && i === 0) {
          // Actualizar la primera talla existente
          const actualizado = await actualizar(
            productoEditando,
            payload
          );

          if (!actualizado) {
            throw new Error(
              `No se pudo actualizar la talla ${variante.talla}.`
            );
          }

          zapatillaId = productoEditando;
        } else {
          // Crear un registro independiente para cada talla adicional
          const nuevoProducto = await crear(payload);

          if (!nuevoProducto) {
            throw new Error(
              `No se pudo registrar la talla ${variante.talla}. Revisa la consola para ver el error del catálogo.`
            );
          }

          zapatillaId = nuevoProducto.id;
        }

        // Actualizar stock del inventario
        await InventarioService.actualizarStock(
          zapatillaId,
          variante.talla,
          variante.stock
        );
      }

      await cargarInventario();

      alert(
        productoEditando !== null
          ? "Producto actualizado correctamente."
          : "Zapatillas registradas correctamente."
      );

      limpiarFormulario();
    } catch (err) {
      console.error(
        "Error al guardar producto o actualizar inventario:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar los productos."
      );

      await cargarInventario();
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar producto
  const eliminarProducto = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este producto?"
    );

    if (!confirmar) return;

    try {
      const resultado = await eliminar(id);

      if (resultado) {
        alert("Producto eliminado correctamente.");
        await cargarInventario();
      }
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      alert("No se pudo eliminar el producto.");
    }
  };

  // Indicadores
  const totalUnidades = productos.reduce(
    (total, producto) =>
      total + obtenerStockReal(producto.id),
    0
  );

  const productosSinStock = productos.filter(
    (producto) => obtenerStockReal(producto.id) <= 0
  ).length;

  const productosDestacados = productos.filter(
    (producto) => producto.destacado === true
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ENCABEZADO */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de productos
          </h1>

          <p className="mt-1 text-gray-500">
            Administra las zapatillas disponibles en UrbanStep.
          </p>
        </div>

        <button
          onClick={() => {
            limpiarFormulario();
            setMostrarFormulario(true);
          }}
          className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
        >
          + Agregar zapatilla
        </button>
      </div>

      {/* RESUMEN */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total de productos</p>
          <p className="mt-2 text-3xl font-bold">
            {productos.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Unidades en stock</p>
          <p className="mt-2 text-3xl font-bold">
            {cargandoInventario ? "..." : totalUnidades}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Productos sin stock</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {cargandoInventario ? "..." : productosSinStock}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Destacados en Home</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {productosDestacados}
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {productoEditando !== null
                ? "Editar zapatilla"
                : "Registrar nueva zapatilla"}
            </h2>

            <button
              type="button"
              onClick={limpiarFormulario}
              className="text-gray-500 hover:text-black"
            >
              ✕ Cerrar
            </button>
          </div>

          <form onSubmit={guardarProducto}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* NOMBRE */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nombre
                </label>

                <input
                  required
                  value={formulario.nombre}
                  onChange={(e) =>
                    cambiarCampo("nombre", e.target.value)
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-black"
                  placeholder="Ej: Air Max 90"
                />
              </div>

              {/* MARCA */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Marca
                </label>

                <input
                  required
                  value={formulario.marca}
                  onChange={(e) =>
                    cambiarCampo("marca", e.target.value)
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-black"
                  placeholder="Ej: Nike"
                />
              </div>

              {/* COLOR */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Color
                </label>

                <input
                  required
                  value={formulario.color}
                  onChange={(e) =>
                    cambiarCampo("color", e.target.value)
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-black"
                  placeholder="Ej: Blanco y negro"
                />
              </div>

              {/* PRECIO */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Precio
                </label>

                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formulario.precio}
                  onChange={(e) =>
                    cambiarCampo("precio", Number(e.target.value))
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-black"
                />
              </div>

              {/* CATEGORÍA */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  ID de categoría
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  value={formulario.categoria.id}
                  onChange={(e) =>
                    setFormulario((actual) => ({
                      ...actual,
                      categoria: {
                        ...actual.categoria,
                        id: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nombre de categoría
                </label>

                <input
                  required
                  value={formulario.categoria.nombre}
                  onChange={(e) =>
                    setFormulario((actual) => ({
                      ...actual,
                      categoria: {
                        ...actual.categoria,
                        nombre: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-black"
                  placeholder="Ej: Running"
                />
              </div>

              {/* IMAGEN */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Ruta o URL de imagen
                </label>

                <input
                  required
                  type="text"
                  value={formulario.imagenUrl}
                  onChange={(e) =>
                    cambiarCampo("imagenUrl", e.target.value)
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-black"
                  placeholder="/imagenes/ultraboost.jpg"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Puedes usar una ruta local o una URL completa.
                </p>

                {formulario.imagenUrl && (
                  <img
                    src={formulario.imagenUrl}
                    alt="Vista previa"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    onLoad={(e) => {
                      e.currentTarget.style.display = "block";
                    }}
                    className="mt-3 h-32 w-32 rounded-lg border object-cover"
                  />
                )}
              </div>

              {/* TALLAS Y STOCK */}
              <div className="md:col-span-2">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Tallas y stock
                    </h3>

                    <p className="text-sm text-gray-500">
                      Agrega las tallas disponibles para esta zapatilla.
                    </p>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    Stock total: {stockTotal}
                  </span>
                </div>

                <div className="space-y-3">
                  {tallas.map((item, indice) => (
                    <div
                      key={indice}
                      className="grid grid-cols-1 items-end gap-3 rounded-lg border bg-gray-50 p-4 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Talla
                        </label>

                        <input
                          required
                          type="number"
                          min="1"
                          value={item.talla}
                          onChange={(e) =>
                            cambiarTalla(
                              indice,
                              "talla",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                          placeholder="Ej: 38"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Stock
                        </label>

                        <input
                          required
                          type="number"
                          min="0"
                          step="1"
                          value={item.stock}
                          onChange={(e) =>
                            cambiarTalla(
                              indice,
                              "stock",
                              Number(e.target.value)
                            )
                          }
                          className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                          placeholder="Ej: 10"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => eliminarTalla(indice)}
                        disabled={tallas.length === 1}
                        className="rounded-lg border border-red-200 px-4 py-3 font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={agregarTalla}
                  className="mt-3 rounded-lg border border-dashed border-gray-400 px-4 py-3 font-semibold text-gray-700 hover:border-black hover:bg-gray-50"
                >
                  + Agregar otra talla
                </button>

                <p className="mt-2 text-xs text-gray-500">
                  Puedes ingresar stock 0 para una talla sin unidades disponibles.
                </p>
              </div>

              {/* DESTACADO */}
              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formulario.destacado ?? false}
                    onChange={(e) =>
                      cambiarCampo("destacado", e.target.checked)
                    }
                    className="h-5 w-5 accent-black"
                  />

                  <div>
                    <p className="font-semibold">
                      Mostrar en el Home
                    </p>

                    <p className="text-sm text-gray-500">
                      Activa esta opción para mostrar la zapatilla en
                      la página principal. Si la desactivas, seguirá
                      apareciendo en el catálogo.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* BOTONES */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {guardando
                  ? "Guardando..."
                  : productoEditando !== null
                    ? "Guardar cambios"
                    : "Registrar producto"}
              </button>

              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-lg border px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ERRORES */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {errorInventario && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {errorInventario}
        </div>
      )}

      {/* TABLA */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold">
            Productos registrados
          </h2>
        </div>

        {cargando ? (
          <p className="p-8 text-center text-gray-500">
            Cargando productos...
          </p>
        ) : productos.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            No hay productos registrados en el catálogo.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-4">Imagen</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Marca</th>
                  <th className="p-4">Talla</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Home</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productos.map((producto) => {
                  const stockReal = obtenerStockReal(producto.id);

                  return (
                    <tr
                      key={producto.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <img
                          src={
                            producto.imagenUrl ||
                            "/imagenes/sin-imagen.png"
                          }
                          alt={producto.nombre}
                          onError={(e) => {
                            e.currentTarget.src =
                              "/imagenes/sin-imagen.png";
                          }}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      </td>

                      <td className="p-4 font-semibold">
                        {producto.nombre}

                        <p className="text-xs font-normal text-gray-500">
                          {producto.color}
                        </p>
                      </td>

                      <td className="p-4">{producto.marca}</td>
                      <td className="p-4">{producto.talla}</td>

                      <td className="p-4">
                        ${producto.precio.toLocaleString("es-CL")}
                      </td>

                      <td className="p-4">
                        <span
                          className={
                            stockReal > 0
                              ? "rounded-full bg-green-100 px-3 py-1 text-green-700"
                              : "rounded-full bg-red-100 px-3 py-1 text-red-700"
                          }
                        >
                          {cargandoInventario ? "..." : stockReal}
                        </span>
                      </td>

                      <td className="p-4">
                        {producto.categoria?.nombre}
                      </td>

                      <td className="p-4">
                        {producto.destacado ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                            Sí
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                            No
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editarProducto(producto)}
                            className="rounded-lg bg-blue-100 px-3 py-2 text-blue-700 hover:bg-blue-200"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => eliminarProducto(producto.id)}
                            className="rounded-lg bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}