import { useCallback, useEffect, useRef, useState } from "react";
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
  stock: string;
};

type FormularioProducto = Omit<
  ProductoPayload,
  "precio" | "stock"
> & {
  precio: string;
  stock: string;
};

const normalizarTalla = (valor: string): string =>
  String(valor ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es");

const normalizarTexto = (valor: string): string =>
  String(valor ?? "")
    .trim()
    .toLocaleLowerCase("es");

const esMismaZapatilla = (
  producto: Producto,
  referencia: Producto
): boolean =>
  normalizarTexto(producto.nombre) ===
    normalizarTexto(referencia.nombre) &&
  normalizarTexto(producto.marca) ===
    normalizarTexto(referencia.marca) &&
  normalizarTexto(producto.color) ===
    normalizarTexto(referencia.color) &&
  normalizarTexto(producto.imagenUrl) ===
    normalizarTexto(referencia.imagenUrl) &&
  Number(producto.categoria?.id) ===
    Number(referencia.categoria?.id) &&
  Number(producto.precio) === Number(referencia.precio);

const formularioInicial: FormularioProducto = {
  nombre: "",
  marca: "",
  color: "",
  precio: "",
  stock: "",
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
    useState<FormularioProducto>(formularioInicial);

  const [tallas, setTallas] = useState<TallaStock[]>([
    { talla: "", stock: "" },
  ]);

  const [variantesEditando, setVariantesEditando] = useState<
    Producto[]
  >([]);

  const [advertenciaTallas, setAdvertenciaTallas] = useState("");

  const [productoEditando, setProductoEditando] =
    useState<number | null>(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const inputImagenRef = useRef<HTMLInputElement>(null);
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState("");

  const seleccionarImagen = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const archivo = event.target.files?.[0];

    if (!archivo) return;

    const formatosPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!formatosPermitidos.includes(archivo.type)) {
      alert("Selecciona una imagen JPG, PNG o WEBP.");
      event.target.value = "";
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      alert("La imagen no puede superar los 5 MB.");
      event.target.value = "";
      return;
    }

    setArchivoImagen(archivo);

    const lector = new FileReader();

    lector.onload = () => {
      if (typeof lector.result === "string") {
        setVistaPrevia(lector.result);
      }
    };

    lector.onerror = () => {
      alert("No se pudo leer la imagen seleccionada.");
    };

    lector.readAsDataURL(archivo);
  };

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

  const obtenerStockReal = (zapatillaId: number): number => {
    return inventario
      .filter((item) => item.zapatillaId === zapatillaId)
      .reduce(
        (total, item) =>
          total + Number(item.cantidadDisponible || 0),
        0
      );
  };

  const obtenerStockPorTalla = (
    zapatillaId: number,
    talla: string
  ): number => {
    const clave = normalizarTalla(talla);

    return inventario
      .filter(
        (item) =>
          item.zapatillaId === zapatillaId &&
          normalizarTalla(item.talla) === clave
      )
      .reduce(
        (total, item) =>
          total + Number(item.cantidadDisponible || 0),
        0
      );
  };

  const stockTotal = tallas.reduce((total, item) => {
    const stock = Number(item.stock);

    return total + (Number.isFinite(stock) && stock > 0 ? stock : 0);
  }, 0);

  const cambiarCampo = (
    campo: keyof FormularioProducto,
    valor: string | number | boolean
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const cambiarTalla = (
    indice: number,
    campo: keyof TallaStock,
    valor: string
  ) => {
    setAdvertenciaTallas("");

    if (campo === "talla") {
      const clave = normalizarTalla(valor);

      if (clave) {
        const indiceExistente = tallas.findIndex(
          (item, i) =>
            i !== indice && normalizarTalla(item.talla) === clave
        );

        if (indiceExistente !== -1) {
          const stockActualizado = tallas[indice].stock;

          setTallas((actual) =>
            actual
              .map((item, i) =>
                i === indiceExistente
                  ? { ...item, stock: stockActualizado }
                  : item
              )
              .filter((_, i) => i !== indice)
          );

          setAdvertenciaTallas(
            `La talla ${valor.trim()} ya estaba agregada. Se actualizó su stock a ${
              stockActualizado || "0"
            } en lugar de duplicarla.`
          );

          return;
        }
      }
    }

    setTallas((actual) =>
      actual.map((item, i) =>
        i === indice
          ? { ...item, [campo]: valor }
          : item
      )
    );
  };

  const agregarTalla = () => {
    setAdvertenciaTallas("");

    setTallas((actual) => [
      ...actual,
      { talla: "", stock: "" },
    ]);
  };

  const eliminarTalla = (indice: number) => {
    if (tallas.length === 1) {
      alert("Debes mantener al menos una talla.");
      return;
    }

    setAdvertenciaTallas("");
    setTallas((actual) =>
      actual.filter((_, i) => i !== indice)
    );
  };

  const limpiarFormulario = () => {
    setFormulario({
      ...formularioInicial,
      categoria: { ...formularioInicial.categoria },
    });

    setTallas([{ talla: "", stock: "" }]);
    setVariantesEditando([]);
    setAdvertenciaTallas("");
    setProductoEditando(null);
    setMostrarFormulario(false);

    setArchivoImagen(null);
    setVistaPrevia("");

    if (inputImagenRef.current) {
      inputImagenRef.current.value = "";
    }
  };

  const editarProducto = (producto: Producto) => {
    const variantes = productos.filter((item) =>
      esMismaZapatilla(item, producto)
    );

    setFormulario({
      nombre: producto.nombre,
      marca: producto.marca,
      color: producto.color,
      precio: String(producto.precio),
      stock: String(obtenerStockReal(producto.id)),
      imagenUrl: producto.imagenUrl || "",
      talla: producto.talla,
      destacado: producto.destacado ?? false,
      categoria: {
        id: producto.categoria.id,
        nombre: producto.categoria.nombre,
      },
    });

    setArchivoImagen(null);
    setVistaPrevia("");
    setAdvertenciaTallas("");

    if (inputImagenRef.current) {
      inputImagenRef.current.value = "";
    }

    setVariantesEditando(variantes);
    setTallas(
      variantes.map((variante) => ({
        talla: variante.talla,
        stock: String(
          obtenerStockPorTalla(variante.id, variante.talla)
        ),
      }))
    );

    setProductoEditando(producto.id);
    setMostrarFormulario(true);
  };

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
      clave: normalizarTalla(item.talla),
      stockTexto: item.stock,
      stock: Number(item.stock),
    }));

    if (tallasNormalizadas.some((item) => !item.talla)) {
      alert("Debes completar todas las tallas.");
      return;
    }

    if (
      tallasNormalizadas.some(
        (item) =>
          item.stockTexto.trim() === "" ||
          !Number.isInteger(item.stock) ||
          !Number.isFinite(item.stock) ||
          item.stock < 0
      )
    ) {
      alert("El stock debe ser un número entero mayor o igual a cero.");
      return;
    }

    if (
      new Set(tallasNormalizadas.map((item) => item.clave)).size !==
      tallasNormalizadas.length
    ) {
      const mensaje =
        "No puedes ingresar la misma talla más de una vez. Revisa las tallas repetidas (sin importar espacios o mayúsculas).";

      setAdvertenciaTallas(mensaje);
      alert(mensaje);
      return;
    }

    if (
      !formulario.nombre.trim() ||
      !formulario.marca.trim()
    ) {
      alert("Completa el nombre y la marca del producto.");
      return;
    }

    const imagenFinal = vistaPrevia || formulario.imagenUrl;

    if (!imagenFinal.trim()) {
      alert("Debes seleccionar una imagen para la zapatilla.");
      return;
    }

    const precioNumerico = Number(formulario.precio);

    if (
      formulario.precio.trim() === "" ||
      !Number.isFinite(precioNumerico) ||
      precioNumerico < 0
    ) {
      alert("El precio debe ser un número mayor o igual a cero.");
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
      // Buscar si ya existe una zapatilla con el mismo nombre y marca
      // para no volver a llamar a POST /zapatillas y provocar el 400.
      const zapatillaBaseExistente = productos.find(
        (item) =>
          normalizarTexto(item.nombre) ===
            normalizarTexto(formulario.nombre) &&
          normalizarTexto(item.marca) ===
            normalizarTexto(formulario.marca)
      );

      let zapatillaIdBase: number | null =
        productoEditando ?? zapatillaBaseExistente?.id ?? null;

      for (let i = 0; i < tallasNormalizadas.length; i++) {
        const variante = tallasNormalizadas[i];

        const payload: ProductoPayload = {
          nombre: formulario.nombre.trim(),
          marca: formulario.marca.trim(),
          color: formulario.color.trim(),
          precio: precioNumerico,
          stock: variante.stock,
          imagenUrl: imagenFinal,
          talla: variante.talla,
          destacado: Boolean(formulario.destacado),
          categoria: {
            id: Number(formulario.categoria.id),
            nombre: formulario.categoria.nombre,
          },
        };

        const productoExistente = variantesEditando.find(
          (item) => normalizarTalla(item.talla) === variante.clave
        );

        let zapatillaId: number;

        if (productoExistente) {
          const actualizado = await actualizar(
            productoExistente.id,
            payload
          );

          if (!actualizado) {
            throw new Error(
              `No se pudo actualizar la talla ${variante.talla}.`
            );
          }

          zapatillaId = productoExistente.id;
        } else if (zapatillaIdBase === null && i === 0) {
          const nuevoProducto = await crear(payload);

          if (!nuevoProducto) {
            throw new Error(
              `No se pudo registrar la talla ${variante.talla}. Revisa la consola para ver el error del catálogo.`
            );
          }

          zapatillaId = nuevoProducto.id;
          zapatillaIdBase = nuevoProducto.id;
        } else {
          // La zapatilla ya existe en catálogo: usar su ID existente
          // y registrar/actualizar la talla en inventario.
          zapatillaId = zapatillaIdBase!;
        }

        await InventarioService.actualizarStock(
          zapatillaId,
          variante.talla,
          variante.stock
        );
      }

      await cargarInventario();

      alert(
        productoEditando !== null || zapatillaBaseExistente
          ? "Producto e inventario actualizados correctamente."
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

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Precio
                </label>

                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.precio}
                  onChange={(e) =>
                    cambiarCampo("precio", e.target.value)
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-black"
                  placeholder="Ej: 49990"
                />
              </div>

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

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Imagen de la zapatilla
                </label>

                <input
                  ref={inputImagenRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={seleccionarImagen}
                  className="hidden"
                />

                {(vistaPrevia || formulario.imagenUrl) && (
                  <div className="mb-4">
                    <img
                      src={vistaPrevia || formulario.imagenUrl}
                      alt="Vista previa de zapatilla"
                      className="h-44 w-44 rounded-xl border bg-gray-50 object-contain p-2"
                    />

                    <p className="mt-2 text-sm text-gray-500">
                      {archivoImagen?.name ||
                        "Imagen actual del producto"}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => inputImagenRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-5 font-semibold text-gray-700 transition hover:border-black hover:bg-gray-50"
                >
                  <span className="text-xl">📷</span>

                  {archivoImagen
                    ? "Cambiar zapatilla"
                    : "Seleccionar zapatilla"}
                </button>

                <p className="mt-2 text-xs text-gray-500">
                  Selecciona una fotografía JPG, PNG o WEBP desde tu
                  computador. Tamaño máximo: 5 MB.
                </p>
              </div>

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
                          type="text"
                          value={item.talla}
                          onChange={(e) =>
                            cambiarTalla(
                              indice,
                              "talla",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                          placeholder="Ej: 38 o M"
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
                              e.target.value
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

                {advertenciaTallas && (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                    {advertenciaTallas}
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  Puedes ingresar stock 0 para una talla sin unidades disponibles. No se permiten tallas repetidas: si repites una, se actualiza el stock de la talla existente.
                </p>
              </div>

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

                      <td className="p-4">
                        <span className="rounded bg-gray-100 px-2.5 py-1 font-medium">
                          {producto.talla}
                        </span>
                      </td>

                      <td className="p-4 font-semibold">
                        ${Number(producto.precio).toLocaleString("es-CL")}
                      </td>

                      <td className="p-4">
                        <span
                          className={`font-semibold ${
                            stockReal > 0
                              ? "text-green-700"
                              : "text-red-600"
                          }`}
                        >
                          {cargandoInventario ? "..." : stockReal}
                        </span>
                      </td>

                      <td className="p-4">
                        {producto.categoria?.nombre ||
                          `ID ${producto.categoria?.id}`}
                      </td>

                      <td className="p-4">
                        {producto.destacado ? (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Sí
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            No
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editarProducto(producto)}
                            className="rounded-lg border px-3 py-1.5 font-medium hover:bg-gray-100"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => eliminarProducto(producto.id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-600 hover:bg-red-50"
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