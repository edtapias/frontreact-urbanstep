import { useState } from "react";
import {
  SoporteService,
  type ConsultaSoporte,
  type NuevaConsultaSoporte,
} from "../services/SoporteService";

interface UsuarioLocal {
  id?: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
}

function obtenerUsuarioLocal(): UsuarioLocal | null {
  try {
    return JSON.parse(localStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
}

function crearEstadoInicial(): NuevaConsultaSoporte {
  const usuario = obtenerUsuarioLocal();
  const nombreCompleto = [usuario?.nombre, usuario?.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    nombre: nombreCompleto,
    correo: usuario?.correo ?? "",
    motivo: "",
    mensaje: "",
    clienteId: usuario?.id ?? null,
  };
}

export function useSoporte() {
  const [form, setForm] = useState<NuevaConsultaSoporte>(crearEstadoInicial);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultaEnviada, setConsultaEnviada] = useState<ConsultaSoporte | null>(
    null
  );

  const actualizarCampo = (
    campo: keyof NuevaConsultaSoporte,
    valor: string
  ) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const limpiarFormulario = () => {
    setForm(crearEstadoInicial());
  };

  const enviarConsulta = async (datos?: NuevaConsultaSoporte) => {
    setEnviando(true);
    setError(null);
    setConsultaEnviada(null);

    try {
      const usuario = obtenerUsuarioLocal();
      const base = datos ?? form;
      const payload: NuevaConsultaSoporte = {
        ...base,
        clienteId: base.clienteId ?? usuario?.id ?? null,
      };

      const creada = await SoporteService.enviarConsulta(payload);
      setConsultaEnviada(creada);
      if (!datos) {
        limpiarFormulario();
      }
      return creada;
    } catch (err) {
      const mensajeError =
        err instanceof Error ? err.message : "Error al enviar la consulta";
      setError(mensajeError);
      return null;
    } finally {
      setEnviando(false);
    }
  };

  return {
    form,
    enviando,
    error,
    consultaEnviada,
    actualizarCampo,
    limpiarFormulario,
    enviarConsulta,
  };
}