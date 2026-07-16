/**
 * https://docs.nestjs.com/recipes/serve-static
 */
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';

import { ServeStaticModule } from '@nestjs/serve-static';
import { CanvasLmsAuthMiddleware } from '@ntucool/nestjs-canvas-lms-auth';
import { FrontendMiddleware } from './middlewares/frontend.middleware';

import path from 'path';

const excludeApiPaths = ['/api/(.*)', '/ltiv1p1/(.*)', '/ltiv1p3/(.*)', '/oauth2/(.*)'];

// TODO: Update frontendPaths for course-withdrawal pages
const frontendPaths = ['/withdrawal'];

@Module({
  imports: [
    ServeStaticModule.forRoot({
      serveRoot: '/',
      rootPath: path.join(__dirname, '../../../frontend/build'),
      exclude: excludeApiPaths,
    }),
  ],
})
export class FrontendModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CanvasLmsAuthMiddleware)
      .exclude(
        { path: '/static/(.*).css', method: RequestMethod.GET },
        { path: '/(.*).png', method: RequestMethod.GET },
        { path: '/(.*).svg', method: RequestMethod.GET },
        { path: '/(.*).ico', method: RequestMethod.GET },
        ...excludeApiPaths.map((path) => ({ path, method: RequestMethod.ALL })),
      )
      .forRoutes({ path: '/**', method: RequestMethod.GET });

    consumer
      .apply(FrontendMiddleware)
      .forRoutes(...frontendPaths.map((path) => ({ path, method: RequestMethod.GET })));
  }
}
