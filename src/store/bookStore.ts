import type { Book } from "@/types/book";
import { create } from "zustand";
import {
  getAllBooks,
  getBook,
  saveBook,
  deleteBook as deleteBookFromDB,
  updateBookReadingTime,
  updateBookScrollPosition,
  setBookReadingTime,
} from "@/lib/database";

type View = "library" | "reader" | "profile";

interface BookStore {
  // Estado
  books: Book[];
  isLoading: boolean;
  error: string | null;
  showUploader: boolean;
  currentView: View;
  currentBook: Book | null;

  // Acciones CRUD
  addBook: (name: string, text: string, totalPages?: number) => Promise<Book>;
  deleteBook: (id: string) => Promise<void>;
  getBookById: (id: string) => Promise<Book | null>;
  loadBooks: () => Promise<void>;

  // Acciones de lectura
  updateReadingTime: (id: string, seconds: number) => Promise<void>;
  setReadingTime: (id: string, totalSeconds: number) => Promise<void>;
  updateScrollPosition: (id: string, position: number) => Promise<void>;

  // Acciones de UI
  setShowUploader: (show: boolean) => void;
  setCurrentView: (view: View) => void;
  setCurrentBook: (book: Book | null) => void;
}

export const useBookStore = create<BookStore>((set) => ({
  // Estado inicial
  books: [],
  isLoading: false,
  error: null,
  showUploader: false,
  currentView: "library",
  currentBook: null,

  // Cargar todos los libros
  loadBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const loadedBooks = await getAllBooks();
      set({ books: loadedBooks, isLoading: false });
    } catch (error) {
      console.error("Error loading books:", error);
      set({ error: "Error al cargar los libros", isLoading: false });
    }
  },

  // Añadir un libro nuevo
  addBook: async (
    name: string,
    text: string,
    totalPages?: number,
  ): Promise<Book> => {
    const newBook: Book = {
      id: crypto.randomUUID(),
      name,
      text,
      createdAt: Date.now(),
      lastReadAt: Date.now(),
      readingTimeSeconds: 0,
      scrollPosition: 0,
      totalPages,
    };

    try {
      await saveBook(newBook);
      set((state) => ({ books: [newBook, ...state.books] }));
      return newBook;
    } catch (error) {
      console.error("Error adding book:", error);
      set({ error: "Error al añadir el libro" });
      throw error;
    }
  },

  // Eliminar un libro
  deleteBook: async (id: string) => {
    try {
      await deleteBookFromDB(id);
      set((state) => ({
        books: state.books.filter((book) => book.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting book:", error);
      set({ error: "Error al eliminar el libro" });
      throw error;
    }
  },

  // Obtener un libro por ID
  getBookById: async (id: string): Promise<Book | null> => {
    try {
      const book = await getBook(id);
      return book || null;
    } catch (error) {
      console.error("Error getting book:", error);
      set({ error: "Error al obtener el libro" });
      return null;
    }
  },

  // Actualizar tiempo de lectura (incrementar)
  updateReadingTime: async (id: string, seconds: number) => {
    try {
      await updateBookReadingTime(id, seconds);
      set((state) => ({
        books: state.books.map((book) =>
          book.id === id
            ? { ...book, readingTimeSeconds: book.readingTimeSeconds + seconds }
            : book,
        ),
      }));
    } catch (error) {
      console.error("Error updating reading time:", error);
      set({ error: "Error al actualizar tiempo de lectura" });
    }
  },

  // Establecer tiempo de lectura (valor absoluto)
  setReadingTime: async (id: string, totalSeconds: number) => {
    try {
      await setBookReadingTime(id, totalSeconds);
      set((state) => ({
        books: state.books.map((book) =>
          book.id === id ? { ...book, readingTimeSeconds: totalSeconds } : book,
        ),
      }));
    } catch (error) {
      console.error("Error setting reading time:", error);
      set({ error: "Error al establecer tiempo de lectura" });
    }
  },

  // Actualizar posición de scroll
  updateScrollPosition: async (id: string, position: number) => {
    try {
      await updateBookScrollPosition(id, position);
      set((state) => ({
        books: state.books.map((book) =>
          book.id === id ? { ...book, scrollPosition: position } : book,
        ),
      }));
    } catch (error) {
      console.error("Error updating scroll position:", error);
      set({ error: "Error al actualizar posición de scroll" });
    }
  },

  // Acciones de UI
  setShowUploader: (show: boolean) => set({ showUploader: show }),
  setCurrentView: (view: View) => set({ currentView: view }),
  setCurrentBook: (book: Book | null) => set({ currentBook: book }),
}));
