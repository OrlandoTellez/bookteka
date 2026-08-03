import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import type { Request, Response } from "express";
import { dbPrisma } from "@/config/prisma.js";
import { env } from "@/config/env.js";
import { AppError } from "@/helper/errors.js";
import type { ROLE } from "@prisma/client";

const ACCESS_TOKEN_SECONDS = 15 * 60;
const REFRESH_TOKEN_SECONDS = 7 * 24 * 60 * 60;
const VERIFICATION_SECONDS = 15 * 60;
const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";

type HeaderMap = Record<string, string | string[] | undefined>;
type AuthHeaders = { headers?: HeaderMap };

type TokenPayload = {
  userId: string;
  email: string;
  role: ROLE;
};

type PublicUser = {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  phone: string | null;
  image: string | null;
  role: ROLE;
  created_at: Date;
  updated_at: Date;
};

type AuthResponse = {
  message: string;
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
};

function getHeader(headers: HeaderMap | undefined, name: string): string | undefined {
  const value = headers?.[name.toLowerCase()] ?? headers?.[name];
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").flatMap((part) => {
      const separator = part.indexOf("=");
      if (separator < 0) return [];
      const key = part.slice(0, separator).trim();
      const value = part.slice(separator + 1).trim();
      return key ? [[key, decodeURIComponent(value)]] : [];
    }),
  );
}

function tokenFromHeaders(headers: HeaderMap | undefined): {
  accessToken?: string;
  refreshToken?: string;
} {
  const authorization = getHeader(headers, "authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : undefined;
  const sessionHeader = getHeader(headers, "x-session-token");
  const refreshHeader = getHeader(headers, "x-refresh-token");
  const cookies = parseCookies(getHeader(headers, "cookie"));
  return {
    accessToken: bearerToken || sessionHeader || cookies[ACCESS_COOKIE],
    refreshToken: refreshHeader || cookies[REFRESH_COOKIE],
  };
}

function signAccessToken(user: { id: string; email: string; role: ROLE }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role } satisfies TokenPayload,
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_SECONDS } satisfies SignOptions,
  );
}

function signRefreshToken(userId: string): string {
  return jwt.sign({ userId, jti: crypto.randomUUID() }, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_SECONDS,
  } satisfies SignOptions);
}

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  phone: string | null;
  image: string | null;
  role: ROLE;
  created_at: Date;
  updated_at: Date;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified: user.email_verified,
    phone: user.phone,
    image: user.image,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function cookieOptions(maxAge: number) {
  const production = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? ("none" as const) : ("lax" as const),
    maxAge: maxAge * 1000,
    path: "/",
  };
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_TOKEN_SECONDS));
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(REFRESH_TOKEN_SECONDS));
}

function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: "/" });
}

function requestHeaders(req: Request): HeaderMap {
  return req.headers as HeaderMap;
}

async function createSession(
  userId: string,
  refreshToken: string,
  headers?: HeaderMap,
  client: Pick<typeof dbPrisma, "session"> = dbPrisma,
): Promise<void> {
  await client.session.create({
    data: {
      user_id: userId,
      token: refreshToken,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_SECONDS * 1000),
      ip_address: getHeader(headers, "x-forwarded-for")?.split(",")[0]?.trim(),
      user_agent: getHeader(headers, "user-agent"),
    },
  });
}

async function issueTokens(
  user: { id: string; email: string; role: ROLE },
  headers?: HeaderMap,
  client: Pick<typeof dbPrisma, "session"> = dbPrisma,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user.id);
  await createSession(user.id, refreshToken, headers, client);
  return { accessToken, refreshToken };
}

async function findUserByAccessToken(token: string): Promise<PublicUser | null> {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload & TokenPayload;
    if (!payload.userId) return null;
    const user = await dbPrisma.user.findFirst({
      where: { id: payload.userId, deleted_at: null },
    });
    return user ? publicUser(user) : null;
  } catch {
    return null;
  }
}

async function getRefreshTokenUser(refreshToken: string) {
  let payload: JwtPayload & { userId?: string };
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload & {
      userId?: string;
    };
  } catch {
    throw new AppError("UNAUTHORIZED", 401, "Refresh token inválido o expirado");
  }

  if (!payload.userId) {
    throw new AppError("UNAUTHORIZED", 401, "Refresh token inválido");
  }

  const session = await dbPrisma.session.findFirst({
    where: { token: refreshToken },
  });
  if (!session) {
    throw new AppError("UNAUTHORIZED", 401, "Sesión inválida");
  }
  if (session.expires_at <= new Date()) {
    await dbPrisma.session.deleteMany({ where: { token: refreshToken } });
    throw new AppError("UNAUTHORIZED", 401, "Sesión expirada");
  }

  const user = await dbPrisma.user.findFirst({
    where: { id: payload.userId, deleted_at: null },
  });
  if (!user) throw new AppError("UNAUTHORIZED", 401, "Usuario no encontrado");
  return { session, user };
}

async function login(
  data: { email: string; password: string },
  headers?: HeaderMap,
): Promise<AuthResponse> {
  const user = await dbPrisma.user.findFirst({
    where: { email: data.email.toLowerCase(), deleted_at: null },
  });
  if (!user) throw new AppError("UNAUTHORIZED", 401, "Credenciales inválidas");

  const account = await dbPrisma.account.findFirst({
    where: { user_id: user.id, provider_id: "credentials" },
  });
  if (!account?.password || !(await bcrypt.compare(data.password, account.password))) {
    throw new AppError("UNAUTHORIZED", 401, "Credenciales inválidas");
  }

  const tokens = await issueTokens(user, headers);
  return { message: "Login exitoso", user: publicUser(user), ...tokens };
}

async function register(
  data: { name: string; email: string; password: string },
  headers?: HeaderMap,
): Promise<AuthResponse> {
  const email = data.email.toLowerCase();
  const existing = await dbPrisma.user.findFirst({ where: { email } });
  if (existing) throw new AppError("CONFLICT", 409, "El correo ya está registrado");

  const password = await bcrypt.hash(data.password, 10);
  const user = await dbPrisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: data.name,
        email,
        role: "user",
        email_verified: false,
      },
    });
    await tx.account.create({
      data: {
        account_id: created.id,
        provider_id: "credentials",
        user_id: created.id,
        password,
      },
    });
    return created;
  });

  await createVerification(data.email.toLowerCase());
  const tokens = await issueTokens(user, headers);
  return { message: "Usuario creado correctamente", user: publicUser(user), ...tokens };
}

async function refresh(
  refreshToken: string,
  headers?: HeaderMap,
): Promise<AuthResponse> {
  const { session, user } = await getRefreshTokenUser(refreshToken);
  const tokens = await dbPrisma.$transaction(async (tx) => {
    // Compare-and-delete makes refresh-token rotation single-use even when
    // two requests arrive concurrently with the same token.
    const deleted = await tx.session.deleteMany({
      where: { id: session.id, token: refreshToken },
    });
    if (deleted.count !== 1) {
      throw new AppError("UNAUTHORIZED", 401, "Sesión ya renovada o revocada");
    }
    return issueTokens(user, headers, tx);
  });
  return { message: "Token renovado correctamente", user: publicUser(user), ...tokens };
}

async function logout(refreshToken: string | undefined): Promise<{ message: string }> {
  if (refreshToken) {
    await dbPrisma.session.deleteMany({ where: { token: refreshToken } });
  }
  return { message: "Sesión cerrada correctamente" };
}

async function getSession({ headers }: AuthHeaders): Promise<{
  user: PublicUser;
  session: { id: string; token: string; expiresAt: Date; userId: string };
} | null> {
  const { accessToken } = tokenFromHeaders(headers);
  if (!accessToken) return null;
  const user = await findUserByAccessToken(accessToken);
  if (!user) return null;

  let payload: JwtPayload & { userId?: string };
  try {
    payload = jwt.verify(accessToken, env.JWT_SECRET) as JwtPayload & { userId?: string };
  } catch {
    return null;
  }
  if (!payload.userId) return null;

  // Access tokens are stateless; expose the JWT as the client session token.
  return {
    user,
    session: {
      id: `access:${payload.jti ?? payload.userId}`,
      token: accessToken,
      expiresAt: new Date((payload.exp ?? 0) * 1000),
      userId: payload.userId,
    },
  };
}

async function verifyEmail(identifier: string, code: string): Promise<{ message: string }> {
  const verification = await dbPrisma.verification.findFirst({
    where: { identifier, value: code },
  });
  if (!verification) throw new AppError("UNAUTHORIZED", 401, "Código de verificación inválido");
  if (verification.expires_at <= new Date()) {
    await dbPrisma.verification.deleteMany({ where: { identifier } });
    throw new AppError("UNAUTHORIZED", 401, "Código de verificación expirado");
  }
  const user = await dbPrisma.user.findFirst({ where: { email: identifier.toLowerCase() } });
  if (!user) throw new AppError("NOT_FOUND", 404, "Usuario no encontrado");
  await dbPrisma.user.update({ where: { id: user.id }, data: { email_verified: true } });
  await dbPrisma.verification.deleteMany({ where: { identifier } });
  return { message: "Correo verificado correctamente" };
}

async function createVerification(identifier: string): Promise<{ message: string; expiresAt: Date }> {
  const value = Array.from({ length: 6 }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)],
  ).join("");
  const expiresAt = new Date(Date.now() + VERIFICATION_SECONDS * 1000);
  await dbPrisma.verification.deleteMany({ where: { identifier } });
  await dbPrisma.verification.create({
    data: { identifier, value, expires_at: expiresAt },
  });
  console.info(`[auth] Código de verificación para ${identifier}: ${value}`);
  return { message: "Si el correo existe, se envió un código", expiresAt };
}

export const auth = {
  api: {
    getSession,
    login: (data: { email: string; password: string }, req: Request) =>
      login(data, requestHeaders(req)),
    register: (data: { name: string; email: string; password: string }, req: Request) =>
      register(data, requestHeaders(req)),
    refresh: (token: string, req: Request) => refresh(token, requestHeaders(req)),
    logout,
    verifyEmail,
    createVerification,
  },
  cookies: {
    set: setAuthCookies,
    clear: clearAuthCookies,
  },
  tokens: {
    fromHeaders: tokenFromHeaders,
  },
};
