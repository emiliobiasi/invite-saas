import { cookie } from '@elysiajs/cookie';
import Elysia from 'elysia';

import { env } from '@config/env';
import { authRoutes } from '@modules/auth/auth.routes';
import { invitesRoutes } from '@modules/invites/invites.routes';
import { usersRoutes } from '@modules/users/users.routes';
import { authMiddleware } from '@middlewares/auth.middleware';
import { errorMiddleware } from '@middlewares/error.middleware';
import { loggerMiddleware } from '@middlewares/logger.middleware';

export const app = new Elysia()
  .use(errorMiddleware)
  .use(loggerMiddleware)
  .use(cookie({ httpOnly: true, sameSite: 'lax' }))
  .use(authMiddleware)
  .get('/health', () => ({ status: 'ok', environment: env.NODE_ENV }))
  .use(authRoutes)
  .use(usersRoutes)
  .use(invitesRoutes);
