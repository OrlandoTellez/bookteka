import type { Book } from "@/types/book";
import { getDatabase } from "../connection";
import { getCurrentUserId } from "../connection";

// Obtiene todos los libros del usuario actual
export async function getAllBooks(): Promise<Book[]> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return [];

  const db = await getDatabase();
  const tx = db.transaction("books", "readonly");
  const index = tx.store.index("by-userId");
  const books = await index.getAll(currentUserId);

  // Ordenar por posición manual (si existe) y, como desempate, por lastRead descendente
  return books.sort(
    (a, b) =>
      (a.position ?? Infinity) - (b.position ?? Infinity) ||
      (b.lastReadAt || 0) - (a.lastReadAt || 0),
  );
}

// Obtiene un libro según su ID
export async function getBook(id: string): Promise<Book | undefined> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return undefined;

  const db = await getDatabase();
  const book = await db.get("books", id);
  return book?.userId === currentUserId ? book : undefined;
}

// Guarda un libro en la base de datos
export async function saveBook(book: Book): Promise<void> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) throw new Error("No hay usuario autenticado");

  const db = await getDatabase();
  await db.put("books", { ...book, userId: currentUserId });
}

// Elimina un libro de la base de datos
// También elimina los marcadores y highlights asociados
export async function deleteBook(id: string): Promise<void> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return;

  const db = await getDatabase();

  // Verificar que el libro pertenece al usuario
  const book = await db.get("books", id);
  if (!book || book.userId !== currentUserId) return;

  await db.delete("books", id);

  // También eliminar marcadores asociados
  const bookmarks = await getBookmarksByBook(id);
  for (const bookmark of bookmarks) {
    await db.delete("bookmarks", bookmark.id);
  }

  // También eliminar highlights asociados
  const highlights = await getHighlightsByBook(id);
  for (const highlight of highlights) {
    await db.delete("highlights", highlight.id);
  }
}

// Actualiza el tiempo de lectura de un libro sumando tiempo adicional
export async function updateBookReadingTime(
  id: string,
  additionalSeconds: number,
): Promise<void> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return;

  const db = await getDatabase();
  const book = await db.get("books", id);
  if (book && book.userId === currentUserId) {
    book.readingTimeSeconds += additionalSeconds;
    book.lastReadAt = Date.now();
    await db.put("books", book);
  }
}

// Establece el tiempo total de lectura de un libro
export async function setBookReadingTime(
  id: string,
  totalSeconds: number,
): Promise<void> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return;

  const db = await getDatabase();
  const book = await db.get("books", id);
  if (book && book.userId === currentUserId) {
    book.readingTimeSeconds = totalSeconds;
    await db.put("books", book);
  }
}

// Actualiza la posición de scroll de un libro
export async function updateBookScrollPosition(
  id: string,
  scrollPosition: number,
): Promise<void> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return;

  const db = await getDatabase();
  const book = await db.get("books", id);
  if (book && book.userId === currentUserId) {
    book.scrollPosition = scrollPosition;
    book.lastReadAt = Date.now();
    await db.put("books", book);
  }
}

// Actualiza la página actual de lectura de un libro
export async function updateBookCurrentPage(
  id: string,
  currentPage: number,
): Promise<void> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return;

  const db = await getDatabase();
  const book = await db.get("books", id);
  if (book && book.userId === currentUserId) {
    book.currentPage = currentPage;
    book.lastReadAt = Date.now();
    await db.put("books", book);
  }
}

// Fija el orden de los libros asignando position = índice en la lista dada
export async function setBookOrder(ids: string[]): Promise<void> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return;

  const db = await getDatabase();
  const tx = db.transaction("books", "readwrite");
  for (let i = 0; i < ids.length; i++) {
    const book = await tx.store.get(ids[i]);
    if (book && book.userId === currentUserId) {
      await tx.store.put({ ...book, position: i });
    }
  }
  await tx.done;
}

// Actualiza la posición de un libro (usada en drag & drop)
export async function updateBookPosition(
  id: string,
  position: number,
): Promise<void> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return;

  const db = await getDatabase();
  const book = await db.get("books", id);
  if (book && book.userId === currentUserId) {
    book.position = position;
    await db.put("books", book);
  }
}

// Importación local para evitar dependencia circular
async function getBookmarksByBook(bookId: string): Promise<import("@/types/book").Bookmark[]> {
  const db = await getDatabase();
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return [];

  const tx = db.transaction("bookmarks", "readonly");
  const index = tx.store.index("by-bookId");
  const bookmarks = await index.getAll(bookId);
  return bookmarks.filter(b => b.userId === currentUserId);
}

async function getHighlightsByBook(bookId: string): Promise<import("@/types/book").Highlight[]> {
  const db = await getDatabase();
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return [];

  const tx = db.transaction("highlights", "readonly");
  const index = tx.store.index("by-bookId");
  const highlights = await index.getAll(bookId);
  return highlights.filter(h => h.userId === currentUserId);
}
