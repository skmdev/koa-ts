import path from 'path';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import Router from 'koa-decorator-ts/router';

import Database from './database';
import Config from '../config';

// import { loggerRegister } from './middlewares/logge';
import errorCatch from './middlewares/error';

import Logger from './logger';

const logger = Logger.getLogger('Koa');
const app = new Koa();
const router = new Router({
  app,
  apiDirPath: `${__dirname}/controllers`,
  jwt: {
    secret: Config.secret,
  },
});

// const logger = getLogger('Koa');

// Middleware
app.use(serve(path.join(__dirname, '../public')));
app.use(Logger.register(logger));
app.use(bodyParser());
app.use(errorCatch());

// Global Error Catch
app.on('error', (err, ctx) => {
  logger.error(err);
  ctx.logger.error(err);
});

init();

async function init() {
  await Database.connect(Config.db);
  router.registerRouters();
  await app.listen(Config.port);
  logger.info('Application is listening port:', Config.port);
  logger.debug('haha:', { test: 'haha' }, 'gaga', { bb: 'cc', vv: 'vv' });
}
