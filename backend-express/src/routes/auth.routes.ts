import { Router } from "express";
import type { Request } from "express";
import { auth } from "@/lib/auth.js";
import { AppError } from "@/helper/errors.js";
import { validate } from "@/middleware/validate.js";
import {
  LoginSchema,
  RegisterSchema,
  ResendVerificationSchema,
  VerifyEmailSchema,
} from "@/schema/auth.schema.js";

export const authRoutes: Router = Router();

function refreshTokenFromRequest(req: Request): string | undefined {
  const fromBody = typeof req.body?.refreshToken === "string"
    ? req.body.refreshToken
    : undefined;
  return fromBody ?? auth.tokens.fromHeaders(req.headers).refreshToken;
}

function setTokens(
  res: Parameters<typeof auth.cookies.set>[0],
  result: { accessToken: string; refreshToken: string },
): void {
  auth.cookies.set(res, result.accessToken, result.refreshToken);
}

authRoutes.post("/register", validate({ body: RegisterSchema }), async (req, res) => {
  const result = await auth.api.register(req.body, req);
  setTokens(res, result);
  res.status(201).json(result);
});

authRoutes.post("/login", validate({ body: LoginSchema }), async (req, res) => {
  const result = await auth.api.login(req.body, req);
  setTokens(res, result);
  res.json(result);
});

// El cliente web puede enviar el refresh token en el body y Tauri lo envía
// mediante x-refresh-token. La ruta acepta ambos transportes.
authRoutes.post("/refresh", async (req, res) => {
  const token = refreshTokenFromRequest(req);
  if (!token) throw new AppError("UNAUTHORIZED", 401, "Refresh token requerido");
  const result = await auth.api.refresh(token, req);
  setTokens(res, result);
  res.json(result);
});

authRoutes.post("/logout", async (req, res) => {
  const result = await auth.api.logout(refreshTokenFromRequest(req));
  auth.cookies.clear(res);
  res.json(result);
});

authRoutes.get("/get-session", async (req, res) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    res.status(401).json({ error: "No autorizado", code: "UNAUTHORIZED" });
    return;
  }
  res.json(session);
});

authRoutes.post("/verify-email", validate({ body: VerifyEmailSchema }), async (req, res) => {
  const result = await auth.api.verifyEmail(req.body.identifier, req.body.code);
  res.json(result);
});

authRoutes.post("/resend-verification", validate({ body: ResendVerificationSchema }), async (req, res) => {
  const result = await auth.api.createVerification(req.body.email);
  res.json(result);
});
