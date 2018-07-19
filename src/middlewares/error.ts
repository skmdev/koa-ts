import { Middleware } from 'koa';

const errorCatch = (): Middleware => async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    ctx.throw(400, e);
  }
};

export default errorCatch;
