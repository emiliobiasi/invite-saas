import { Elysia } from "elysia";
import { auth } from "../../config/auth";

export const authRoutes = new Elysia().all("/api/auth/*", ({ request }) => {
  return auth.handler(request);
});
