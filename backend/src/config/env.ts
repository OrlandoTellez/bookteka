import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  DATABASE_URL: string;
  FRONTEND_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
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
  BETTER_AUTH_SECRET: getEnvVar("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: getEnvVar("BETTER_AUTH_URL"),
};
