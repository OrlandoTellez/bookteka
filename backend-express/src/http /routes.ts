import type { Express, Request, Response, NextFunction } from "express";

import {
  authLimiter,
  sessionLimiter,
  progressLimiter,
  globalLimiter,
  isProgressPath,
} from "@/config/rate-limit.js";

import { authRoutes } from "@/routes/auth.routes.js";
import { book as bookRoutes } from "@/routes/book.routes.js";
import { bookmark as bookmarkRoutes } from "@/routes/bookmark.routes.js";
import { streak as streakRoutes } from "@/routes/streak.routes.js";

import { errorHandler } from "@/middleware/errorHandler.js";
import { healthHandler } from "./health.js";

export function registerRoutes(app: Express) {
  app.get("/api/v1/health", healthHandler);

  app.use("/api/v1/auth/get-session", sessionLimiter);
  app.use("/api/v1/auth", authLimiter, authRoutes);

  app.use("/api/v1", (req, res, next) => {
    if (isProgressPath(req.path)) {
      return progressLimiter(req, res, next);
    }

    next();
  });

  app.use("/api/v1", globalLimiter);

  app.use("/api/v1/books", bookRoutes);
  app.use("/api/v1/books", bookmarkRoutes);
  app.use("/api/v1/streak", streakRoutes);

  app.use((_req: Request, res: Response, _next: NextFunction) => {
    res.status(404).json({
      error: "Ruta no encontrada",
    });
  });

  app.use(errorHandler);
}
