import * as pdfjsLib from "pdfjs-dist";
import type { Book } from "@/types/book";

// Configurar el worker de pdf.js desde la carpeta public
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

import { booksApi } from "@/api/book";

export async function downloadAndExtractPdfText(
  bookId: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  try {
    onProgress?.(10);

    const response = await booksApi.stream(bookId);

    if (!response.ok) {
      throw new Error("Error al descargar el PDF");
    }

    onProgress?.(30);

    // Obtener el arrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    onProgress?.(50);

    // Cargar el PDF con pdf.js
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    const fullText: string[] = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      // Añadir marcador de página
      fullText.push(`[PAGE_${pageNum}] ${pageText}`);

      // Actualizar progreso
      const progress = 50 + Math.round((pageNum / totalPages) * 40);
      onProgress?.(progress);
    }

    onProgress?.(100);
    return fullText.join("\n\n");
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw error;
  }
}

// Descarga un PDF y lo guarda como blob en IndexedDB
export async function downloadPdfToBlob(fileUrl: string): Promise<Blob> {
  const response = await fetch(fileUrl, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al descargar el PDF");
  }

  return response.blob();
}

// Obtiene una URL firmado para descargar el PDF (si el backend lo requiere)
export async function getSignedDownloadUrl(bookId: string): Promise<string> {
  const { url } = await booksApi.download(bookId);
  return url;
}

// Procesa un libro: descarga el PDF si es necesario y extrae el texto
export async function processBookForReading(
  book: Book,
  onProgress?: (progress: number) => void,
): Promise<Book> {
  // Si ya tiene texto, no descargar de nuevo
  if (book.text && book.text.length > 10) {
    return book;
  }

  // Descargar y extraer texto usando el endpoint del backend
  if (book.id) {
    try {
      const text = await downloadAndExtractPdfText(book.id, onProgress);
      return { ...book, text };
    } catch (error) {
      console.error("Error processing book:", error);
      throw error;
    }
  }

  throw new Error("El libro no tiene ID para descargar");
}
