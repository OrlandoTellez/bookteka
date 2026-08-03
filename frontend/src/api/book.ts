import { api, type RequestOptions } from "./client";

export interface CloudBook {
  id: string;
  name: string;
  author: string;
  createdAt: number;
  lastReadAt: number;
  readingTimeSeconds: number;
  scrollPosition: number;
  currentPage: number;
  fileUrl: string | null;
  fileKey: string | null;
  isSynced: boolean;
}

export interface UploadBookResponse {
  bookId: string;
  userBookId: string;
}

export interface DownloadBookResponse {
  url: string;
}

export interface DeleteBookResponse {
  success: boolean;
  message: string;
  auditId: string;
}

export interface UpdateProgressData {
  readingTimeSeconds?: number;
  scrollPosition?: number;
  currentPage?: number;
  lastReadAt?: number;
}

export interface UpdateProgressResponse {
  success: boolean;
  readingTimeSeconds: number;
  scrollPosition: number;
  currentPage: number;
  lastReadAt?: Date | null;
}

export const booksApi = {
  list: () => api.get<CloudBook[]>("/books"),

  upload: (formData: FormData) =>
    api.post<UploadBookResponse>("/books/upload", formData),

  download: (bookId: string) =>
    api.get<DownloadBookResponse>(`/books/${bookId}/download`),

  stream: (bookId: string) => api.raw(`/books/${bookId}/stream`),

  updateProgress: (
    bookId: string,
    data: UpdateProgressData,
    options?: RequestOptions,
  ) =>
    api.patch<UpdateProgressResponse>(`/books/${bookId}/progress`, data, options),

  remove: (bookId: string) => api.delete<DeleteBookResponse>(`/books/${bookId}`),
};


export const uploadBook = async (formData: FormData): Promise<string> => {
  const data = await booksApi.upload(formData);
  return data.bookId || (data as UploadBookResponse & { id?: string }).id || "";
};

export const downloadBook = async (bookId: string): Promise<string> => {
  const { url } = await booksApi.download(bookId);
  return url;
};

export const deleteBookInCloud = (bookId: string) => booksApi.remove(bookId);

export const updateBookProgress = (
  bookId: string,
  data: UpdateProgressData,
  options?: RequestOptions,
) => booksApi.updateProgress(bookId, data, options);
