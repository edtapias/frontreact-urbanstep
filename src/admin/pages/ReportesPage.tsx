
import { useState } from "react";

const API = "/api/reportes";

export default function ReportesPage() {
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  const [desde, setDesde] = useState(fechaHoy);
  const [hasta, setHasta] = useState(fechaHoy);
  const [resultado, setResultado] = useState<any>(null);
  const [tipo, setTipo] = useState("");
  const [cargando, setCargando] = useState(false);

  const reportes = [
    ["ventas", "Ventas", "Ingresos y ventas por período", "💰"],
    ["pedidos", "Pedidos", "Pedidos realizados por período", "📦"],
    ["inventario", "Inventario", "Estado actual del stock", "👟"],
  ];

  const generar = async (t: string) => {
    if (t !== "inventario" && desde > hasta) {
      setTipo(t);
      setResultado({ error: "La fecha inicial debe ser anterior a la final." });
      return;
    }

    setTipo(t);
    setCargando(true);
    setResultado(null);

    try {
      const rutas: Record<string, string> = {
        ventas: `/ventas?inicio=${desde}&fin=${hasta}`,
        pedidos: `/pedidos?inicio=${desde}&fin=${hasta}`,
        inventario: "/inventario",
      };

      const res = await fetch(API + rutas[t]);
      if (!res.ok) throw new Error("No se pudo generar el reporte.");
      setResultado(await res.json());
    } catch (err) {
      setResultado({
        error: err instanceof Error ? err.message : "Error al generar el reporte.",
      });
    } finally {
      setCargando(false);
    }
  };

  const lista = (data: any): any[] =>
    Array.isArray(data) ? data : data?.content ?? data?.data ?? data?.pedidos ?? data?.productos ?? [];

  const dinero = (valor: number) =>
    Number(valor || 0).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });

  const fecha = (valor: any) => {
    if (!valor) return "-";
    const texto = String(valor);
    const date = new Date(texto.length === 10 ? `${texto}T12:00:00` : texto);
    return isNaN(date.getTime()) ? texto : date.toLocaleDateString("es-CL");
  };

  const pedidos = tipo === "pedidos" ? lista(resultado) : [];
  const inventario = tipo === "inventario" ? lista(resultado) : [];

  const pagados = pedidos.filter(p => p.estado?.toUpperCase() === "PAGADO");
  const pendientes = pedidos.filter(p => p.estado?.toUpperCase() === "PENDIENTE");
  const cancelados = pedidos.filter(p => p.estado?.toUpperCase() === "CANCELADO");

  const ingresos = pagados.reduce((s, p) => s + Number(p.total || 0), 0);
  const unidades = inventario.reduce((s, p) => s + Number(p.stock || 0), 0);
  const sinStock = inventario.filter(p => Number(p.stock) <= 0).length;
  const stockBajo = inventario.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length;

  const dineroEstado = (estado: string) =>
    estado?.toUpperCase() === "PAGADO"
      ? "bg-green-100 text-green-700"
      : estado?.toUpperCase() === "PENDIENTE"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  const tabla = (datos: any[], columnas: string[], esInventario = false) => (
    <div className="overflow-x-auto rounded-xl border">
      {datos.length ? (
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F3EF] text-gray-600">
            <tr>{columnas.map(c => <th key={c} className="p-4 capitalize">{c === "productoId" ? "ID producto" : c}</th>)}</tr>
          </thead>
          <tbody>
            {datos.map((fila, i) => (
              <tr key={fila.productoId ?? fila.id ?? i} className="border-t hover:bg-gray-50">
                {columnas.map(c => {
                  const valor = c === "productoId"
                    ? fila.productoId ?? fila.id
                    : fila[c];

                  return (
                    <td key={c} className="p-4">
                      {c === "total" || c === "precio"
                        ? dinero(valor)
                        : c.toLowerCase().includes("fecha")
                        ? fecha(valor)
                        : c === "estado"
                        ? <span className={`rounded-full px-3 py-1 text-xs ${dineroEstado(valor)}`}>{valor}</span>
                        : c === "stock" && esInventario
                        ? <strong>{valor ?? 0}</strong>
                        : typeof valor === "object"
                        ? valor?.nombre ?? valor?.id ?? "-"
                        : valor ?? "No disponible"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p className="p-8 text-center text-gray-500">No hay registros para mostrar.</p>}
    </div>
  );

  const tarjeta = (nombre: string, valor: any, color = "bg-[#F5F3EF]") => (
    <div className={`rounded-xl p-5 ${color}`}>
      <p className="text-sm text-gray-500">{nombre}</p>
      <strong className="mt-2 block text-2xl">{valor}</strong>
    </div>
  );

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 p-6">
      <header>
        <h1 className="text-3xl font-bold text-[#393632]">Reportes</h1>
        <p className="mt-2 text-[#77716A]">Análisis y rendimiento de UrbanStep.</p>
      </header>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">Período del reporte</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Desde
            <input type="date" value={desde} max={hasta} onChange={e => setDesde(e.target.value)} className="mt-2 w-full rounded-lg border p-3" />
          </label>
          <label className="text-sm">Hasta
            <input type="date" value={hasta} min={desde} max={fechaHoy} onChange={e => setHasta(e.target.value)} className="mt-2 w-full rounded-lg border p-3" />
          </label>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {reportes.map(([id, nombre, descripcion, icono]) => (
          <div key={id} className="rounded-xl bg-white p-6 shadow-sm">
            <span className="text-3xl">{icono}</span>
            <h2 className="mt-3 text-lg font-bold">{nombre}</h2>
            <p className="mt-2 text-sm text-gray-500">{descripcion}</p>
            <button onClick={() => generar(id)} disabled={cargando} className="mt-5 w-full rounded-lg bg-[#393632] p-3 text-sm text-white disabled:opacity-50">
              {cargando && tipo === id ? "Generando..." : "Generar reporte"}
            </button>
          </div>
        ))}
      </section>

      {cargando && <p className="rounded-xl bg-white p-6">Generando reporte...</p>}

      {resultado && !cargando && (
        <section className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
          <header>
            <h2 className="text-xl font-bold capitalize">Resultado: {tipo}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {tipo === "inventario" ? "Estado actual de las existencias." : `Desde ${fecha(desde)} hasta ${fecha(hasta)}.`}
            </p>
          </header>

          {resultado.error ? (
            <p className="rounded-lg bg-red-50 p-4 text-red-600">{resultado.error}</p>
          ) : tipo === "ventas" ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {tarjeta("Ingresos totales", dinero(resultado.ingresosTotales))}
              {tarjeta("Pedidos pagados", resultado.cantidadPedidos ?? 0)}
              {tarjeta("Período", `${fecha(resultado.fechaInicio)} - ${fecha(resultado.fechaFin)}`)}
            </div>
          ) : tipo === "pedidos" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tarjeta("Total pedidos", pedidos.length)}
                {tarjeta("Pagados", pagados.length, "bg-green-50")}
                {tarjeta("Pendientes", pendientes.length, "bg-yellow-50")}
                {tarjeta("Ingresos pagados", dinero(ingresos))}
              </div>

              <div className="rounded-xl border p-5">
                <h3 className="mb-4 font-bold">Estado de los pedidos</h3>
                {[["Pagados", pagados.length, "bg-green-500"], ["Pendientes", pendientes.length, "bg-yellow-500"], ["Cancelados", cancelados.length, "bg-red-500"]].map(([nombre, cantidad, color]) => (
                  <div key={String(nombre)} className="mb-4">
                    <div className="mb-2 flex justify-between text-sm"><span>{nombre}</span><strong>{cantidad}</strong></div>
                    <div className="h-3 rounded-full bg-gray-100">
                      <div className={`h-3 rounded-full ${color}`} style={{ width: `${pedidos.length ? Number(cantidad) / pedidos.length * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-bold">Detalle de pedidos</h3>
              {tabla(pedidos, ["id", "clienteId", "total", "estado", "fechaCreacion"])}
            </>
          ) : tipo === "inventario" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tarjeta("Total de productos", inventario.length)}
                {tarjeta("Unidades en stock", unidades, "bg-green-50")}
                {tarjeta("Stock bajo", stockBajo, "bg-yellow-50")}
                {tarjeta("Productos sin stock", sinStock, "bg-red-50")}
              </div>

              <div>
                <h3 className="mb-3 font-bold">Estado actual del inventario</h3>
                <p className="mb-4 text-sm text-gray-500">Existencias agrupadas por producto y todas sus tallas.</p>
                {tabla(inventario, ["productoId", "nombre", "categoria", "stock"], true)}
              </div>
            </>
          ) : null}
        </section>
      )}
    </div>
  );
}
