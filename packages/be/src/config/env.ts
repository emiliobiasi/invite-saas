import { z } from "zod/v4";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().transform((v) => v || undefined).optional(),
  GOOGLE_CLIENT_SECRET: z.string().transform((v) => v || undefined).optional(),
  STRIPE_SECRET_KEY: z.string().transform((v) => v || undefined).optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().transform((v) => v || undefined).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().transform((v) => v || undefined).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
