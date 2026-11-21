
interface Props {
  puntuacion: number;
  seleccionable?: boolean;
  onChange?: (puntuacion: number) => void;
  tamano?: number;
}

export default function Estrellas({
  puntuacion,
  seleccionable = false,
  onChange,
  tamano = 20,
}: Props) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((estrella) => (
        <button
          key={estrella}
          type="button"
          disabled={!seleccionable}
          onClick={() => onChange?.(estrella)}
          aria-label={`${estrella} estrellas`}
          className={`border-none bg-transparent p-0 ${
            seleccionable ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <span
            style={{ fontSize: `${tamano}px` }}
            className={
              estrella <= puntuacion
                ? "text-yellow-400"
                : "text-gray-300"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
