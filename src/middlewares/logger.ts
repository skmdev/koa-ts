import { configure, getLogger as getLogger4, Logger } from 'log4js';
import { Middleware } from 'koa';

configure({
  appenders: {
    app: {
      type: 'console',
      level: 'all',
      layout: {
        type: 'pattern',
        pattern: '%[%d{yyyy-MM-dd - hh:mm:ss} | [%p]%] %c: %[%x{message}%]',
        tokens: {
          message: function(logEvent) {
            if (logEvent.data[0].message) {
              return logEvent.data[0].message;
            } else {
              return logEvent.data.join(' ');
            }
          },
        },
      },
    },
    applogger: {
      logger: {},
      type: 'file',
      filename: './logs/app.log',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd - hh:mm:ss} | [%p] %c: %x{message}',
        tokens: {
          message: function(logEvent) {
            if (logEvent.data[0].message) {
              return logEvent.data[0].message;
            } else {
              return logEvent.data.join(' ');
            }
          },
        },
      },
    },
    errlogger: {
      type: 'file',
      filename: './logs/err.log',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd - hh:mm:ss} | [%p] %c: %n%m',
      },
    },
    justError: {
      type: 'logLevelFilter',
      appender: 'errlogger',
      level: 'error',
    },
  },
  categories: {
    default: {
      appenders: ['app', 'applogger', 'justError'],
      level: 'info',
    },
  },
});

// let logger = getLogger('gaga');

export const getLogger = getLogger4;

let requestID = 0;

export const loggerRegister = (logger: Logger): Middleware => async (
  ctx,
  next: any,
) => {
  ctx.logger = logger;
  const currentRequestID = requestID++;

  const startTime = process.hrtime();
  ctx.logger.info(`→ (ID:${currentRequestID}) ${ctx.method} ${ctx.url}`);
  if (ctx.method.toLowerCase() == 'post' || ctx.method.toLowerCase() == 'put') {
    ctx.logger.info(
      `→ (ID:${currentRequestID}) ${ctx.method} ${JSON.stringify(
        ctx.request.body,
      )}`,
    );
  }

  await next();

  const endTime = process.hrtime();
  const elapsed =
    (endTime[0] - startTime[0]) * 1000 + (endTime[1] - startTime[1]) / 1000000;
  ctx.logger.info(
    `← (ID:${currentRequestID}) ${ctx.method} ${ctx.url} : Status(${ctx.status}) Time(${elapsed.toFixed(
      0,
    )}ms)`,
  );
};
