import Elysia from 'elysia';
import { z } from 'zod';

import { loginController, logoutController, registerController } from './auth.controller';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = registerSchema;

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/register', registerController, {
    body: registerSchema,
    detail: {
      tags: ['auth'],
      summary: 'Register a new user',
    },
  })
  .post('/login', loginController, {
    body: loginSchema,
    detail: {
      tags: ['auth'],
      summary: 'Login and receive auth token',
    },
  })
  .post('/logout', logoutController, {
    detail: {
      tags: ['auth'],
      summary: 'Logout current session',
    },
  });
