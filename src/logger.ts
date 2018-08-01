import Pino, { LevelMapping } from 'pino';
import childProcess from 'child_process';
import stream from 'stream';
import { Middleware } from 'Koa';
import path from 'path';

import Config from '../config';
import moment from 'moment';

const cwd = process.cwd();
const { env } = process;

// Log to multiple files using a separate process
const child = childProcess.spawn(
  process.execPath,
  [
    require.resolve('pino-tee'),
    '0', // 0 for all log
    path.resolve(cwd, Config.logger.appLog),
    'error',
    path.resolve(cwd, Config.logger.errorLog),
  ],
  { cwd, env },
);

const logThrough = new stream.PassThrough();
logThrough.pipe(child.stdin);

// Log pretty messages to console (optional, for development purposes only)
const pretty = Pino.pretty({
  forceColor: true,
});

pretty.pipe(process.stdout);

logThrough.pipe(pretty);

class Logger {
  private static requestID = 0;

  public static getLogger(name: string) {
    return Pino({ name }, logThrough);
  }

  public static register = (logger: any): Middleware => async (
    ctx,
    next: any,
  ) => {
    ctx.logger = logger;
    const currentRequestID = Logger.requestID++;

    const startTime = process.hrtime();
    ctx.logger.info(`→ (ID:${currentRequestID}) ${ctx.method} ${ctx.url}`);
    if (['post', 'put'].indexOf(ctx.method.toLowerCase()) > -1) {
      ctx.logger.info(
        `→ (ID:${currentRequestID}) ${ctx.method} ${JSON.stringify(
          ctx.request.body,
        )}`,
      );
    }

    await next();

    const endTime = process.hrtime();
    const elapsed =
      (endTime[0] - startTime[0]) * 1000 +
      (endTime[1] - startTime[1]) / 1000000;
    ctx.logger.info(
      `← (ID:${currentRequestID}) ${ctx.method} ${ctx.url} : Status(${ctx.status}) Time(${elapsed.toFixed(
        0,
      )}ms)`,
    );
  };
}

export default Logger;
