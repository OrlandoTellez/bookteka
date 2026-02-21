import express from "express";
import cors from "cors";
import { env } from "@/config/env";
import { auth } from "@/lib/auth";
import { toNodeHandler } from "better-auth/node";
import dotenv from "dotenv";

const app = express();

dotenv.config();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API working correctly",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", auth.handler);

app.listen(env.PORT, () =>
  console.log(`Server initialize in http://localhost:${env.PORT}`),
);
