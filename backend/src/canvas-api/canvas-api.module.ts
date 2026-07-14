import { ConfigModule, ConfigService } from '@nestjs/config';
import { CanvasApiModule as NtuCoolCanvasApiModule } from '@ntucool/nestjs-canvas-api';

import { CanvasConfig } from './canvas-api.config';

export const CanvasApiModule = NtuCoolCanvasApiModule.registerAsync({
  imports: [ConfigModule.forFeature(CanvasConfig)],
  useFactory: (configService: ConfigService) => {
    return {
      canvas: {
        url: configService.getOrThrow<string>('canvas.host'),
        token: configService.getOrThrow<string>('canvas.token'),
      },
    };
  },
  inject: [ConfigService],
});
