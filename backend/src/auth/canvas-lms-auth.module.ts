import { CanvasLmsAuthModule } from '@ntucool/nestjs-canvas-lms-auth';
import { CanvasLmsAuthOptionsService } from './services/canvas-lms-auth-options.service';
import { CanvasLmsAuthSessionManager } from './services/canvas-lms-auth-session.manager';
import { SessionModule } from '../session/session.module';
import { CanvasApiModule } from '../canvas-api/canvas-api.module';

export const CanvasLmsAuthDynamicModule = CanvasLmsAuthModule.registerAsync({
  imports: [SessionModule, CanvasApiModule],
  useClass: CanvasLmsAuthOptionsService,
  extraProviders: [CanvasLmsAuthSessionManager],
});
