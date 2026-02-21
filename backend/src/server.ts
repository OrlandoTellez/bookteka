import express from "express";
import cors from "cors";
import { env } from "./config/env";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API working correctly",
    timestamp: new Date().toISOString(),
  });
});

app.listen(env.PORT, () =>
  console.log(`Server initialize in http://localhost:${env.PORT}`),
);
