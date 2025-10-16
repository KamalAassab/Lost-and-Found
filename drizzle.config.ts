import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./db/migrations",
  dialect: "mysql",
  strict: true,
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "test",
    database: process.env.DB_NAME || "ecommerce",
  },
} satisfies Config;
