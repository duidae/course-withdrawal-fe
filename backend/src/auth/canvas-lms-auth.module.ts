import { ConfigModule } from '@nestjs/config';
import { CanvasLmsAuthModule } from '@ntucool/nestjs-canvas-lms-auth';
import { AuthConfig } from './config/auth.config';
import { CanvasLmsAuthOptionsService } from './services/canvas-lms-auth-options.service';
import { CanvasLmsAuthLauncherLtiv1p3 } from './launcher/canvas-lms-auth-ltiv1p3.launcher';
import { CanvasLmsAuthSessionManager } from './services/canvas-lms-auth-session.manager';
import { SessionModule } from '../session/session.module';
import { CanvasApiModule } from '../canvas-api/canvas-api.module';
import { CourseWithdrawalDbModule } from '../database/course-withdrawal-db/course-withdrawal-db.module';

export const CanvasLmsAuthDynamicModule = CanvasLmsAuthModule.registerAsync({
  imports: [
    ConfigModule.forFeature(AuthConfig),
    SessionModule,
    CanvasApiModule,
    CourseWithdrawalDbModule,
  ],
  useClass: CanvasLmsAuthOptionsService,
  useLtiv1p3Launcher: CanvasLmsAuthLauncherLtiv1p3,
  extraProviders: [CanvasLmsAuthSessionManager],
});
