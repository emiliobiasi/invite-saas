import { eq } from 'drizzle-orm';

import { db } from '@db/client';
import { users } from '@db/schema';
import { hashPassword, verifyPassword } from '@utils/crypto';
import { signJwt } from '@utils/jwt';

export type RegisterInput = {
  email: string;
  password: string;
};

export type LoginInput = RegisterInput;

export type AuthResult = {
  token: string;
  user: {
    id: string;
    email: string;
  };
};

async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  return user;
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    const error = new Error('Email already registered');
    (error as any).status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(input.password);

  const [created] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
    })
    .returning({ id: users.id, email: users.email });

  const token = await signJwt({ sub: created.id, email: created.email });

  return { token, user: created };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await findUserByEmail(input.email);

  if (!user) {
    const error = new Error('Invalid credentials');
    (error as any).status = 401;
    throw error;
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    const error = new Error('Invalid credentials');
    (error as any).status = 401;
    throw error;
  }

  const token = await signJwt({ sub: user.id, email: user.email });

  return {
    token,
    user: { id: user.id, email: user.email },
  };
}
