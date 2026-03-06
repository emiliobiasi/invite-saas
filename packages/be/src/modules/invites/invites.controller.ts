import type { Context } from 'elysia';

import { requireAuth } from '@middlewares/auth.middleware';

import { createInvite, listInvitesForUser, type CreateInviteInput } from './invites.service';

export async function listInvitesController(ctx: Context) {
  requireAuth(ctx);
  const data = await listInvitesForUser(ctx.user.id);
  return { invites: data };
}

export async function createInviteController(ctx: Context & { body: CreateInviteInput }) {
  requireAuth(ctx);
  const invite = await createInvite(ctx.user.id, ctx.body);
  return { invite };
}
