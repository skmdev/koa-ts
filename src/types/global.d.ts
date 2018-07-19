import { Logger } from 'log4js';
import { IContext } from 'koa-decorator-ts';

declare module 'koa' {
  interface Context {
    logger: Logger;
  }
}
