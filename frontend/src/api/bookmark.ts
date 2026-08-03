import { api } from "./client";

export interface CreateBookmarkPayload {
  name: string;
  pageNumber: number;
  textPreview?: string;
}

export interface BookmarkResponse {
  id: string;
  userId: string;
  userBookId: string;
  name: string;
  pageNumber: number;
  textPreview: string | null;
  createdAt: string;
}

export const bookmarksApi = {
  list: (bookId: string) =>
    api.get<BookmarkResponse[]>(`/books/${bookId}/bookmarks`),

  create: (bookId: string, data: CreateBookmarkPayload) =>
    api.post<BookmarkResponse>(`/books/${bookId}/bookmarks`, data),

  remove: (bookId: string, bookmarkId: string) =>
    api.delete<{ message?: string }>(`/books/${bookId}/bookmarks/${bookmarkId}`),

  update: (
    bookId: string,
    bookmarkId: string,
    data: Partial<CreateBookmarkPayload>,
  ) =>
    api.patch<BookmarkResponse>(
      `/books/${bookId}/bookmarks/${bookmarkId}`,
      data,
    ),
};


export const createBookmark = (
  bookId: string,
  data: CreateBookmarkPayload,
) => bookmarksApi.create(bookId, data);

export const getBookmarks = (bookId: string) => bookmarksApi.list(bookId);

export const deleteBookmark = (bookId: string, bookmarkId: string) =>
  bookmarksApi.remove(bookId, bookmarkId);

export const updateBookmark = (
  bookId: string,
  bookmarkId: string,
  data: Partial<CreateBookmarkPayload>,
) => bookmarksApi.update(bookId, bookmarkId, data);
