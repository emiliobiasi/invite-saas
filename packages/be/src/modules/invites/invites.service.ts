import { desc, eq } from 'drizzle-orm';

import { db } from '@db/client';
import { invites } from '@db/schema';

export async function listInvitesForUser(userId: string) {
  return db
    .select({
      id: invites.id,
      title: invites.title,
      description: invites.description,
      expiresAt: invites.expiresAt,
      createdAt: invites.createdAt,
    })
    .from(invites)
    .where(eq(invites.creatorId, userId))
    .orderBy(desc(invites.createdAt));
}

export type CreateInviteInput = {
  title: string;
  description?: string | null;
  expiresAt?: Date | null;
};

export async function createInvite(userId: string, input: CreateInviteInput) {
  const [created] = await db
    .insert(invites)
    .values({
      creatorId: userId,
      title: input.title,
      description: input.description ?? null,
      expiresAt: input.expiresAt ?? null,
    })
    .returning({
      id: invites.id,
      title: invites.title,
      description: invites.description,
      expiresAt: invites.expiresAt,
      createdAt: invites.createdAt,
    });

  return created;
}
