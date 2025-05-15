import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./db/migrations",
  dialect: "mysql",
  strict: true,
  dbCredentials: {
    host: "localhost",
    user: "root",
    password: "test",
    database: "ecommerce",
  },
} satisfies Config;
