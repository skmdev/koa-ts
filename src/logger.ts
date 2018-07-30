import Pino from 'pino';
import childProcess from 'child_process';
import stream from 'stream';
import { Middleware } from 'Koa';

const cwd = process.cwd();
const { env } = process;
const logPath = `${cwd}/logs`;

// Log to multiple files using a separate process
const child = childProcess.spawn(
  process.execPath,
  [
    require.resolve('pino-tee'),
    'error',
    `${logPath}/error.log`,
    // ' > ',
    // `${logPath}/app.log`,
  ],
  { cwd, env },
);

console.log(`${logPath}/app.log`);

const logThrough = new stream.PassThrough();
logThrough.pipe(child.stdin);

// Log pretty messages to console (optional, for development purposes only)
const pretty = Pino.pretty({
  forceColor: true,
  // formatter: (log) => {
  //   log.hostname;
  //   return log.time;
  // },
});

pretty.pipe(process.stdout);

logThrough.pipe(pretty);

class Logger {
  private static requestID = 0;

  public static getLogger(name: string, prettyOptions?: Pino.PrettyOptions) {
    return Pino({ name }, logThrough); // logThrough
  }

  public static register = (logger: any): Middleware => async (
    ctx,
    next: any,
  ) => {
    ctx.logger = logger;
    const currentRequestID = Logger.requestID++;

    const startTime = process.hrtime();
    ctx.logger.info(`→ (ID:${currentRequestID}) ${ctx.method} ${ctx.url}`);
    if (
      ctx.method.toLowerCase() == 'post' ||
      ctx.method.toLowerCase() == 'put'
    ) {
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
