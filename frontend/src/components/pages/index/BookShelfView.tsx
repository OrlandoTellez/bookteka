import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Clock, BookOpen, Trash2 } from "lucide-react";
import styles from "./BookShelfView.module.css";
import type { Book } from "@/database";
import { OpenBookModal } from "@/components/modals/OpenBookModal";
import { DeleteModal } from "@/components/modals/DeleteModal";


interface BookShelfViewProps {
  books: Book[];
  onOpen: (book: Book) => Promise<void>;
  onDelete: (id: string) => void;
  onMove: (draggedId: string, beforeId: string | null, afterId: string | null) => void;
  isProcessingPdf?: boolean;
  downloadingBookId?: string;
  pdfProgress?: number;
}

const BOOK_COLORS = [
  { cover: "hsl(16, 55%, 42%)", spine: "hsl(16, 55%, 35%)", accent: "hsl(45, 70%, 65%)" },
  { cover: "hsl(145, 40%, 32%)", spine: "hsl(145, 40%, 25%)", accent: "hsl(45, 70%, 70%)" },
  { cover: "hsl(220, 50%, 38%)", spine: "hsl(220, 50%, 30%)", accent: "hsl(45, 65%, 65%)" },
  { cover: "hsl(35, 55%, 40%)", spine: "hsl(35, 55%, 32%)", accent: "hsl(40, 40%, 90%)" },
  { cover: "hsl(340, 45%, 38%)", spine: "hsl(340, 45%, 30%)", accent: "hsl(45, 70%, 70%)" },
  { cover: "hsl(180, 35%, 33%)", spine: "hsl(180, 35%, 26%)", accent: "hsl(45, 65%, 65%)" },
  { cover: "hsl(270, 35%, 38%)", spine: "hsl(270, 35%, 30%)", accent: "hsl(45, 70%, 70%)" },
  { cover: "hsl(25, 60%, 38%)", spine: "hsl(25, 60%, 30%)", accent: "hsl(40, 50%, 85%)" },
  { cover: "hsl(0, 50%, 35%)", spine: "hsl(0, 50%, 28%)", accent: "hsl(45, 70%, 70%)" },
  { cover: "hsl(200, 40%, 35%)", spine: "hsl(200, 40%, 28%)", accent: "hsl(45, 65%, 65%)" },
];

function getBookColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return BOOK_COLORS[Math.abs(hash) % BOOK_COLORS.length];
}

function getBookThickness(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 3) - hash);
  return 40 + (Math.abs(hash) % 30);
}

function getBookHeight(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 4) - hash);
  return 200 + (Math.abs(hash) % 30);
}

function formatTime(seconds: number) {
  if (seconds < 60) return "< 1 min";
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m} min`;
}

function truncateTitle(name: string, maxLen: number) {
  const clean = name.replace(/\.pdf$/i, "");
  return clean.length > maxLen ? clean.slice(0, maxLen) + "…" : clean;
}

const ShelfBook = ({
  book,
  onOpen,
  onDelete,
  isProcessingPdf,
  downloadingBookId,
  pdfProgress,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
}: {
  book: Book;
  onOpen: (book: Book) => Promise<void>;
  onDelete: (id: string) => void;
  isProcessingPdf?: boolean;
  downloadingBookId?: string;
  pdfProgress?: number;
  isDragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragEnter: (id: string) => void;
  onDrop: (id: string) => void;
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);

  const color = getBookColor(book.name);
  const thickness = getBookThickness(book.name);
  const height = getBookHeight(book.name);
  const isReading = book.scrollPosition > 0;
  const isDownloading = isProcessingPdf && downloadingBookId === book.id;
  const title = truncateTitle(book.name, 24);
  const progress = book.totalPages
    ? Math.min(100, Math.round(((book.currentPage ?? 0) / book.totalPages) * 100))
    : 0;

  return (
    <div
      className={`${styles.bookWrapper} ${isDragging ? styles.dragging : ""}`}
      style={{ width: thickness, height }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", book.id);
        onDragStart(book.id);
      }}
      onDragEnd={onDragEnd}
      onDragEnter={(e) => {
        e.preventDefault();
        onDragEnter(book.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(book.id);
      }}
    >
      <button
        onClick={() => setBookModalOpen(true)}
        className={styles.bookButton}
      >
        <div
          className={styles.book}
          style={{ backgroundColor: color.cover }}
        >
          <div className={styles.title} style={{ color: color.accent }}>
            {title}
          </div>

          {isReading && <div className={styles.progress} />}

          <div
            className={styles.spine}
            style={{
              background: `linear-gradient(to right, ${color.spine})`,
            }}
          />
        </div>
      </button>

      {/* Tooltip */}
      <div className={styles.tooltip}>
        <div
          className={styles.tooltipAccent}
          style={{
            background: `linear-gradient(90deg, ${color.spine}, ${color.cover})`,
          }}
        />

        <div className={styles.tooltipBody}>
          <p className={styles.tooltipTitle}>
            {book.name.replace(/\.pdf$/i, "")}
          </p>

          <span
            className={`${styles.statusBadge} ${isReading ? styles.statusReading : styles.statusNew}`}
          >
            {isReading ? "En progreso" : "Sin empezar"}
          </span>

          <div className={styles.tooltipInfo}>
            <div><Clock size={12} /> {formatTime(book.readingTimeSeconds)}</div>
            {book.totalPages ? (
              <div><BookOpen size={12} /> {book.totalPages} pág.</div>
            ) : null}
          </div>

          {book.totalPages ? (
            <div className={styles.tooltipProgress}>
              <div
                className={styles.tooltipProgressFill}
                style={{ width: `${progress}%`, background: color.cover }}
              />
            </div>
          ) : null}

          <div className={styles.tooltipActions}>
            <span className={styles.tooltipOpenLabel}>
              <BookOpen size={12} />
              Ver libro
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmOpen(true);
              }}
              disabled={isDownloading}
              title={isDownloading ? "Espera a que termine la descarga" : undefined}
              aria-label="Eliminar libro"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de libro abierto */}
      {bookModalOpen && (
        <OpenBookModal
          book={book}
          color={color}
          onClose={() => setBookModalOpen(false)}
          onRead={() => {
            // El modal se mantiene abierto mientras el libro se descarga
            // de la nube (el botón muestra el progreso) y se cierra al
            // terminar, cuando la vista cambia al lector.
            void (async () => {
              await onOpen(book);
              setBookModalOpen(false);
            })();
          }}
          isDownloading={isDownloading}
          downloadProgress={isDownloading ? pdfProgress : undefined}
        />
      )}

      {/* Modal de confirmación de borrado (mismo componente que grid y lista) */}
      {confirmOpen && (
        <DeleteModal
          book={book}
          onClose={() => setConfirmOpen(false)}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

const BookShelfView = ({
  books,
  onOpen,
  onDelete,
  onMove,
  isProcessingPdf,
  downloadingBookId,
  pdfProgress,
}: BookShelfViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const [localBooks, setLocalBooks] = useState<Book[]>(books);
  const localBooksRef = useRef<Book[]>(books);

  useEffect(() => {
    const ids = books.map((b) => b.id);
    const localIds = localBooksRef.current.map((b) => b.id);
    if (ids.length === localIds.length && ids.every((id, i) => id === localIds[i])) {
      return;
    }
    localBooksRef.current = books;
    setLocalBooks(books);
  }, [books]);

  const estWidth = useRef(
    typeof window !== "undefined"
      ? window.innerWidth - 60 // 20px padding del main + 20px padding del booksRow + 20px de margen de seguridad
      : Infinity,
  );
  const [shelfWidth, setShelfWidth] = useState(estWidth.current);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setShelfWidth(el.clientWidth);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Mueve el libro arrastrado a la posición del objetivo (reorden en vivo)
  const reorderLocal = useCallback((draggedId: string, targetId: string) => {
    const prev = localBooksRef.current;
    const from = prev.findIndex((b) => b.id === draggedId);
    const to = prev.findIndex((b) => b.id === targetId);
    if (from === -1 || to === -1 || from === to) return;
    const next = [...prev];
    const [moved] = next.splice(from, 1);
    next.splice(from < to ? to - 1 : to, 0, moved);
    localBooksRef.current = next;
    setLocalBooks(next);
  }, []);

  // Al soltar: persistir el nuevo orden calculando los vecinos del libro
  const handleDrop = useCallback(
    (targetId: string) => {
      const id = dragId;
      if (!id) return;
      if (id !== targetId) reorderLocal(id, targetId);
      const list = localBooksRef.current;
      const idx = list.findIndex((b) => b.id === id);
      const beforeId = idx > 0 ? list[idx - 1].id : null;
      const afterId = idx >= 0 && idx < list.length - 1 ? list[idx + 1].id : null;
      onMove(id, beforeId, afterId);
      setDragId(null);
    },
    [dragId, reorderLocal, onMove],
  );

  const shelves = useMemo(() => {
    const result: Book[][] = [];
    if (localBooks.length === 0) {
      result.push([]);
      return result;
    }
    // Sin medición previa (primer render), usar una fila única
    const available = shelfWidth > 0 ? shelfWidth : Infinity;
    const padding = 40; // 20px por lado en .booksRow
    const gap = 4;
    let current: Book[] = [];
    let used = padding;
    for (const book of localBooks) {
      const width = getBookThickness(book.name) + gap;
      if (current.length > 0 && used + width > available) {
        result.push(current);
        current = [];
        used = padding;
      }
      current.push(book);
      used += width;
    }
    if (current.length > 0) result.push(current);
    return result;
  }, [localBooks, shelfWidth]);

  return (
    <div
      className={`${styles.container} ${dragId ? styles.dragging : ""}`}
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setDragId(null);
      }}
    >
      {shelves.map((shelfBooks, idx) => (
        <div key={idx} className={styles.shelfUnit}>
          <div className={styles.booksRow}>
            {shelfBooks.map((book) => (
              <ShelfBook
                key={book.id}
                book={book}
                onOpen={onOpen}
                onDelete={onDelete}
                isProcessingPdf={isProcessingPdf}
                downloadingBookId={downloadingBookId}
                pdfProgress={pdfProgress}
                isDragging={dragId === book.id}
                onDragStart={setDragId}
                onDragEnd={() => setDragId(null)}
                onDragEnter={(id) => {
                  if (dragId && dragId !== id) reorderLocal(dragId, id);
                }}
                onDrop={handleDrop}
              />
            ))}
          </div>
          <div className={styles.shelf} />
        </div>
      ))}
    </div>
  );
};

export default BookShelfView;
