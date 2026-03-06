import type { Context } from 'elysia';

import { requireAuth } from '@middlewares/auth.middleware';

import { getUserById } from './users.service';

export async function getCurrentUserController(ctx: Context) {
  requireAuth(ctx);
  const user = await getUserById(ctx.user.id);

  if (!user) {
    const error = new Error('User not found');
    (error as any).status = 404;
    throw error;
  }

  return { user };
}
