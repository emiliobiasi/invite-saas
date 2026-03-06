import Elysia from 'elysia';

import { getCurrentUserController } from './users.controller';

export const usersRoutes = new Elysia({ prefix: '/users' }).get('/me', getCurrentUserController, {
  detail: {
    tags: ['users'],
    summary: 'Get current user profile',
  },
});
