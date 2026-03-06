import type { AuthUser } from '@middlewares/auth.middleware';

declare module 'elysia' {
  interface Context {
    user?: AuthUser;
  }
}
