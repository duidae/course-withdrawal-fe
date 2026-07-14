import { registerAs } from '@nestjs/config';

export const CanvasConfig = registerAs('canvas', () => ({
  host: process.env.CANVAS_HOST,
  token: process.env.CANVAS_ADMIN_ACCESS_TOKEN,
}));
