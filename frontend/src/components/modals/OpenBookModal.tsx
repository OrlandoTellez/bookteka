import { useEffect } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Play,
  X,
} from "lucide-react";
import styles from "./OpenBookModal.module.css";
import type { Book } from "@/types/book";
import { formatTime } from "@/utils/time";
import { Spinner } from "@/components/common/Spinner";

interface OpenBookColor {
  cover: string;
  spine: string;
  accent: string;
}

// Devuelve el mismo color HSL oscurecido (baja la luminosidad).
function darkenHsl(hsl: string, amount = 14): string {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hsl;
  const h = match[1];
  const s = match[2];
  const l = Math.max(0, Number(match[3]) - amount);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

interface OpenBookModalProps {
  book: Book;
  color: OpenBookColor;
  onRead: () => void;
  onClose: () => void;
  isDownloading?: boolean;
  downloadProgress?: number;
}

export const OpenBookModal = ({
  book,
  color,
  onRead,
  onClose,
  isDownloading,
  downloadProgress,
}: OpenBookModalProps) => {
  const title = book.name.replace(/\.pdf$/i, "");
  const isReading = book.scrollPosition > 0;
  const lastRead = new Date(book.lastReadAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const progress = book.totalPages
    ? Math.min(100, Math.round(((book.currentPage ?? 0) / book.totalPages) * 100))
    : 0;
  const frameColor = darkenHsl(color.cover, 14);

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={styles.stage} onClick={(e) => e.stopPropagation()}>
        <div className={styles.book}>
          {/* Página izquierda: interior de la portada */}
          <div
            className={styles.pageLeft}
            style={{ background: color.cover }}
          >
            <div className={styles.coverFrame} style={{ borderColor: frameColor }}>
              <div className={styles.pageLeftInner}>
                <BookOpen size={42} color={color.accent} strokeWidth={1.5} />
                <span className={styles.coverTitle} style={{ color: color.accent }}>
                  {title}
                </span>
              </div>
            </div>
          </div>

          {/* Lomo central */}
          <div className={styles.spine} style={{ background: color.spine }} />

          {/* Página derecha: detalles del libro */}
          <div className={styles.pageRight}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>
              {isReading ? "En progreso" : "Sin empezar"}
            </p>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <Clock size={16} />
                <div>
                  <span className={styles.metaLabel}>Tiempo leído</span>
                  <span className={styles.metaValue}>
                    {formatTime(book.readingTimeSeconds)}
                  </span>
                </div>
              </div>
              <div className={styles.metaItem}>
                <FileText size={16} />
                <div>
                  <span className={styles.metaLabel}>Páginas</span>
                  <span className={styles.metaValue}>{book.totalPages ?? "—"}</span>
                </div>
              </div>
              <div className={styles.metaItem}>
                <CalendarDays size={16} />
                <div>
                  <span className={styles.metaLabel}>Última lectura</span>
                  <span className={styles.metaValue}>{lastRead}</span>
                </div>
              </div>
              <div className={styles.metaItem}>
                <CheckCircle2 size={16} />
                <div>
                  <span className={styles.metaLabel}>Progreso</span>
                  <span className={styles.metaValue}>{progress}%</span>
                </div>
              </div>
            </div>

            {book.totalPages ? (
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%`, background: color.cover }}
                />
              </div>
            ) : null}

            <div className={styles.actions}>
              <button
                className={styles.readButton}
                style={isDownloading ? undefined : { background: color.cover }}
                onClick={onRead}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Spinner size={18} />
                    Descargando{" "}
                    {downloadProgress !== undefined
                      ? `${Math.round(downloadProgress)}%`
                      : "..."}
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    {isReading ? "Continuar leyendo" : "Leer libro"}
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
