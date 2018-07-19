import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-decorator-ts/router';

import Database from './database';
import Config from '../config';

import { loggerRegister, getLogger } from './middlewares/logger';
import errorCatch from './middlewares/error';

const app = new Koa();
const router = new Router({
  app,
  apiDirPath: `${__dirname}/controllers`,
  jwt: {
    secret: Config.secret,
  },
});

const logger = getLogger('Koa');

// Middleware
app.use(loggerRegister(logger));
app.use(bodyParser());
app.use(errorCatch());

// Global Error Catch
app.on('error', (err, ctx) => {
  ctx.logger.error(err);
});

init();

async function init() {
  await Database.connect(Config.db);
  router.registerRouters();
  await app.listen(Config.port);
  logger.info('Application is listening port:', Config.port);
}
