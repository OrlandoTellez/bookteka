import pkg from "pg";
import dotenv from "dotenv";
import { env } from "./env";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});
