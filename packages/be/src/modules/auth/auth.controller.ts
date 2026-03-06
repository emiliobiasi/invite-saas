import type { Context } from 'elysia';

import { AUTH_COOKIE } from '@middlewares/auth.middleware';

import { loginUser, registerUser, type LoginInput, type RegisterInput } from './auth.service';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export async function registerController({ body, setCookie }: Context & { body: RegisterInput }) {
  const result = await registerUser(body);

  setCookie(AUTH_COOKIE, result.token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return { user: result.user };
}

export async function loginController({ body, setCookie }: Context & { body: LoginInput }) {
  const result = await loginUser(body);

  setCookie(AUTH_COOKIE, result.token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return { user: result.user };
}

export function logoutController({ removeCookie }: Context) {
  removeCookie(AUTH_COOKIE);
  return { success: true };
}
