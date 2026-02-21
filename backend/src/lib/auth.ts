import { betterAuth } from "better-auth";
import { pool } from "@/config/db";
import { env } from "@/config/env";

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [`${env.FRONTEND_URL}`],
});
