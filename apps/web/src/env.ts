import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
});

const optionalSchema = z.object({
  SKIP_ENV_VALIDATION: z.string().optional(),
});

const allSchema = serverSchema.merge(clientSchema).merge(optionalSchema);

const rawEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
};

if (rawEnv.SKIP_ENV_VALIDATION !== "1") {
  allSchema.parse(rawEnv);
}

export const env = {
  DATABASE_URL: rawEnv.DATABASE_URL ?? "",
  DIRECT_URL: rawEnv.DIRECT_URL ?? "",
  SESSION_SECRET: rawEnv.SESSION_SECRET ?? "",
  NEXT_PUBLIC_APP_URL: rawEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_APP_NAME: rawEnv.NEXT_PUBLIC_APP_NAME ?? "Fortress Fund",
  SKIP_ENV_VALIDATION: rawEnv.SKIP_ENV_VALIDATION,
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;
