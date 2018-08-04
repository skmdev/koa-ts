import Pino from 'pino';
import { IContext } from 'koa-decorator-ts';

declare module 'koa' {
  interface Context {
    logger: Pino.Logger;
  }
}
