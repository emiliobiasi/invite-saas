import { Elysia } from 'elysia';

export const loggerMiddleware = new Elysia({ name: 'request-logger' })
  .derive(() => ({ startTime: performance.now() }))
  .onAfterHandle(({ request, set, startTime }) => {
    const duration = performance.now() - startTime;
    const url = new URL(request.url);
    const status = set.status ?? 200;
    console.log(`${request.method} ${url.pathname} -> ${status} (${duration.toFixed(1)}ms)`);
  });
