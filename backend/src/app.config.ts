import { registerAs } from '@nestjs/config';

export const AppConfig = registerAs('app', () => ({
  host: process.env.APP_HOST,
  port: Number(process.env.APP_PORT) || 3000,
  enableCors: process.env.ENABLE_CORS === 'true',
}));

export const LoggerConfig = registerAs('logger', () => ({
  console: {
    level: process.env.CONSOLE_LOG_LEVEL,
  },
  file: {
    level: process.env.FILE_LOG_LEVEL,
    filename: `${process.env.NODE_ENV}.%DATE%.log`,
    dirname: process.env.LOG_DIRECTORY,
  },
}));
