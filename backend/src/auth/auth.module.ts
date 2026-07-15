import { Module } from '@nestjs/common';
import { CanvasLmsAuthGuard } from '@ntucool/nestjs-canvas-lms-auth';
import { SessionModule } from '../session/session.module';
import { CanvasLmsAuthDynamicModule } from './canvas-lms-auth.module';
import { CanvasLmsAuthSessionManager } from './services/canvas-lms-auth-session.manager';

@Module({
  imports: [SessionModule, CanvasLmsAuthDynamicModule],
  providers: [CanvasLmsAuthSessionManager, CanvasLmsAuthGuard],
  exports: [CanvasLmsAuthSessionManager, CanvasLmsAuthGuard],
})
export class AuthModule {}
