import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  DATABASE_URL: string;
  FRONTEND_URL: string;
}

function getEnvVar(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error("env not found");
  }

  return value;
}

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  FRONTEND_URL: getEnvVar("FRONTEND_URL"),
};
