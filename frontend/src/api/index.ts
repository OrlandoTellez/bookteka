export { api, ApiError } from "./client";
export type { RequestOptions } from "./client";

export { authApi, AuthApiError } from "./auth";
export type { AuthUser, SessionData, AuthResponse } from "./auth";

export { booksApi } from "./book";
export type {
  CloudBook,
  UploadBookResponse,
  DownloadBookResponse,
  DeleteBookResponse,
  UpdateProgressData,
  UpdateProgressResponse,
} from "./book";

export { bookmarksApi } from "./bookmark";
export type { CreateBookmarkPayload, BookmarkResponse } from "./bookmark";

export { streakApi } from "./streak";
export type { StreakResponse } from "./streak";
