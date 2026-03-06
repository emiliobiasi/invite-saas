import { Elysia } from 'elysia';

export const errorMiddleware = new Elysia({ name: 'error-handler' }).onError(({ error, set }) => {
  const status =
    'status' in error && typeof (error as any).status === 'number' ? (error as any).status : 500;

  set.status = status;

  return {
    message: status >= 500 ? 'Internal server error' : error.message,
    statusCode: status,
  };
});
