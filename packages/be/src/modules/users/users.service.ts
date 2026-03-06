import { eq } from 'drizzle-orm';

import { db } from '@db/client';
import { users } from '@db/schema';

export async function getUserById(id: string) {
  const [user] = await db
    .select({ id: users.id, email: users.email, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, id));

  return user ?? null;
}
