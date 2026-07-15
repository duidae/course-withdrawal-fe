import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CanvasLmsAuthModuleOptions,
  CanvasLmsAuthModuleOptionsFactory,
} from '@ntucool/nestjs-canvas-lms-auth';
import { CanvasLmsAuthSessionManager } from './canvas-lms-auth-session.manager';

@Injectable()
export class CanvasLmsAuthOptionsService implements CanvasLmsAuthModuleOptionsFactory {
  constructor(
    private configService: ConfigService,
    private authSessionManager: CanvasLmsAuthSessionManager,
  ) {}

  createOptions(): Promise<CanvasLmsAuthModuleOptions> {
    return Promise.resolve({
      app: { url: new URL(this.configService.getOrThrow<string>('app.host')) },
      canvas: { url: new URL(this.configService.getOrThrow<string>('canvas.host')) },
      session: this.authSessionManager,
    });
  }
}
