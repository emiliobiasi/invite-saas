import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { env } from "./config/env";
import { errorHandler } from "./lib/error-handler";
import { healthRoutes } from "./modules/health/health.routes";
import { authRoutes } from "./modules/auth/auth.routes";

const app = new Elysia()
  .use(cors())
  .use(errorHandler)
  .use(healthRoutes)
  .use(authRoutes)
  .listen(env.PORT);

console.log(`Server running at ${app.server?.url}`);

export type App = typeof app;
