
import { useEffect, useState } from "react";
import PedidoService, {
  type Pedido,
} from "../../services/PedidoService";

function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState<number | null>(null);

  // Cargar pedidos desde el backend
  const cargarPedidos = async () => {
    try {
      setCargando(true);
      setError("");

      const datos = await PedidoService.listarAdmin();
      setPedidos(datos);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      setError("No se pudieron cargar los pedidos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  // Actualizar estado de un pedido
  const cambiarEstado = async (id: number, estado: string) => {
    try {
      setActualizando(id);

      const pedidoActualizado =
        await PedidoService.actualizarEstado(id, estado);

      setPedidos((pedidosActuales) =>
        pedidosActuales.map((pedido) =>
          pedido.id === id ? pedidoActualizado : pedido
        )
      );

      alert("Estado del pedido actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      alert("No se pudo actualizar el estado del pedido.");
    } finally {
      setActualizando(null);
    }
  };

  if (cargando) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-red-500">{error}</p>

        <button
          onClick={cargarPedidos}
          className="mt-4 rounded bg-black px-4 py-2 text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de pedidos</h1>
          <p className="text-gray-500">
            Administra y revisa los pedidos de UrbanStep.
          </p>
        </div>

        <button
          onClick={cargarPedidos}
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Actualizar lista
        </button>
      </div>

      {pedidos.length === 0 ? (
        <p className="rounded-lg bg-gray-100 p-6 text-gray-600">
          No hay pedidos registrados.
        </p>
      ) : (
        <div className="space-y-6">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">
                    Pedido #{pedido.id}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Cliente: {pedido.clienteId}
                  </p>

                  <p className="text-sm text-gray-500">
                    Fecha: {pedido.fechaCreacion}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold">
                    Total: ${pedido.total.toLocaleString("es-CL")}
                  </p>

                  <span className="text-sm font-semibold">
                    {pedido.estado}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="mb-2 font-semibold">
                  Productos del pedido
                </h3>

                {pedido.detalles?.length > 0 ? (
                  <div className="space-y-2">
                    {pedido.detalles.map((detalle) => (
                      <div
                        key={detalle.id}
                        className="flex flex-wrap justify-between gap-2 rounded bg-gray-50 p-3 text-sm"
                      >
                        <div>
                          <p className="font-medium">
                            {detalle.nombreProducto}
                          </p>
                          <p className="text-gray-500">
                            Talla: {detalle.talla} | Cantidad:{" "}
                            {detalle.cantidad}
                          </p>
                        </div>

                        <p className="font-semibold">
                          ${detalle.precioUnitario.toLocaleString("es-CL")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Este pedido no tiene detalles disponibles.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                <label
                  htmlFor={`estado-${pedido.id}`}
                  className="font-medium"
                >
                  Cambiar estado:
                </label>

                <select
                  id={`estado-${pedido.id}`}
                  value={pedido.estado}
                  disabled={
                    actualizando === pedido.id ||
                    pedido.estado === "CANCELADO"
                  }
                  onChange={(e) =>
                    cambiarEstado(pedido.id, e.target.value)
                  }
                  className="rounded border border-gray-300 px-3 py-2"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="PAGADO">Pagado</option>
                  <option value="EN_PREPARACION">En preparación</option>
                  <option value="ENVIADO">Enviado</option>
                  <option value="ENTREGADO">Entregado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>

                {actualizando === pedido.id && (
                  <span className="text-sm text-gray-500">
                    Actualizando...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPedidosPage;
