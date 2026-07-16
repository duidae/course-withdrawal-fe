import { Module } from '@nestjs/common';
import { CanvasLmsAuthGuard } from '@ntucool/nestjs-canvas-lms-auth';
import { SessionModule } from '../session/session.module';
import { CanvasLmsAuthDynamicModule } from './canvas-lms-auth.module';
import { CanvasLmsAuthSessionManager } from './services/canvas-lms-auth-session.manager';
import { CourseWithdrawalDbModule } from '../database/course-withdrawal-db/course-withdrawal-db.module';

@Module({
  imports: [SessionModule, CourseWithdrawalDbModule, CanvasLmsAuthDynamicModule],
  providers: [CanvasLmsAuthSessionManager, CanvasLmsAuthGuard],
  exports: [CanvasLmsAuthSessionManager, CanvasLmsAuthGuard],
})
export class AuthModule {}
