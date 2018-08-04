import Koa from 'koa';
import { Route, Controller } from 'koa-decorator-ts';

@Controller('/user')
class UserController {
  @Route.get({ path: '/', unless: true })
  static async test(ctx: Koa.Context) {
    ctx.logger.info('test');
    ctx.body = 'test';
  }
}

export default UserController;
