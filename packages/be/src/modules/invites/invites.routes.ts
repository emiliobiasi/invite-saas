import Elysia from 'elysia';
import { z } from 'zod';

import { createInviteController, listInvitesController } from './invites.controller';

const createInviteSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
});

export const invitesRoutes = new Elysia({ prefix: '/invites' })
  .get('/', listInvitesController, {
    detail: {
      tags: ['invites'],
      summary: 'List invites created by current user',
    },
  })
  .post('/', createInviteController, {
    body: createInviteSchema,
    detail: {
      tags: ['invites'],
      summary: 'Create a new invite (stub)',
    },
  });
