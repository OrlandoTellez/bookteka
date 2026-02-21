import { betterAuth } from "better-auth";
import { pool } from "@/config/db";

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
});
