import { Router } from "express";
import {
  getUserStreak,
  completeDay,
  initializeStreak,
} from "@/controllers/streak.controller.js";
import { validate } from "@/middleware/validate.js";
import { requireAuth } from "@/middleware/requireAuth.js";
import {
  CompleteDayBodySchema,
  InitializeStreakBodySchema,
} from "@/schema/streak.schema.js";

export const streak: Router = Router();

streak.use(requireAuth);

streak.get("/", getUserStreak);

streak.post(
  "/complete",
  validate({ body: CompleteDayBodySchema }),
  completeDay,
);

streak.post(
  "/initialize",
  validate({ body: InitializeStreakBodySchema }),
  initializeStreak,
);
