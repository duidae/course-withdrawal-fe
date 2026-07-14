import { Module } from '@nestjs/common';
import { CanvasApiModule } from './canvas-api/canvas-api.module';
import { FrontendModule } from './frontend/frontend.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [CanvasApiModule, FrontendModule, SessionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
