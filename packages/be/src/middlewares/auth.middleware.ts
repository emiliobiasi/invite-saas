import { Elysia } from 'elysia';

import { verifyJwt } from '@utils/jwt';

export type AuthUser = {
  id: string;
  email?: string;
};

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const AUTH_COOKIE = 'auth_token';

export const authMiddleware = new Elysia({ name: 'auth-middleware' }).derive(
  async ({ cookie, headers }) => {
    const bearer = headers.get('authorization');
    const token = cookie?.[AUTH_COOKIE]?.value ?? bearer?.replace('Bearer ', '') ?? null;

    if (!token) {
      return { user: undefined };
    }

    const payload = await verifyJwt(token);

    if (!payload?.sub) {
      return { user: undefined };
    }

    return { user: { id: payload.sub, email: payload.email } satisfies AuthUser };
  },
);

export function requireAuth(ctx: { user?: AuthUser }): asserts ctx is { user: AuthUser } {
  if (!ctx.user) {
    throw new HttpError(401, 'Unauthorized');
  }
}

export { AUTH_COOKIE };
