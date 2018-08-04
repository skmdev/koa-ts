import path from 'path';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import Router from 'koa-decorator-ts/router';

import Database from './database';
import Config from '../config';

import errorCatch from './middlewares/error';

import Logger from './logger';

class Server {
  public static logger = Logger.getLogger('Server');
  private app = new Koa();
  private router = new Router({
    app: this.app,
    apiDirPath: `${__dirname}/controllers`,
    jwt: {
      secret: Config.secret,
    },
  });

  public logger = Logger.getLogger('KoaApp');

  public static async init() {
    const server = new this();
    server.initMiddleware();
    server.router.registerRouters();
    // Global Error Catch
    server.app.on('error', (err, ctx) => {
      server.logger.error(err);
      ctx.logger.error(err);
    });
    return server;
  }

  initMiddleware() {
    this.app.use(serve(path.join(__dirname, '../public')));
    this.app.use(Logger.register(this.logger));
    this.app.use(bodyParser());
    this.app.use(errorCatch());
  }

  async start() {
    await this.app.listen(Config.port);
  }
}

Server.init()
  .then(async (server) => {
    await Database.connect(Config.db);
    await server.start();
    server.logger.info('Application is listening port:', Config.port);
  })
  .catch((e) => Server.logger.error(e));
