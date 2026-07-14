import { registerAs } from '@nestjs/config';
import { ClientOpts } from 'redis';

export const SessionConfig = registerAs('session', () => {
  return {
    secret: process.env.SESSION_SECRET,
  };
});

/**
 * https://github.com/NodeRedis/node-redis#rediscreateclient
 */
export const RedisConfig = registerAs('redis', (): ClientOpts => {
  let port: number | undefined = +(process.env.REDIS_PORT ?? '6379');
  if (!port || isNaN(port)) {
    port = undefined;
  }

  let password = process.env.REDIS_PASSWORD;
  if (!password) {
    password = undefined;
  }

  return {
    host: process.env.REDIS_HOST,
    port: port,
    password: password,
  };
});
