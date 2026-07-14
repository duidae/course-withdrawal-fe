import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import session from 'express-session';

import redis from 'redis';
import { ClientOpts } from 'redis';

import connectRedis from 'connect-redis';

const RedisStore = connectRedis(session);
const DefaultStore = session.MemoryStore;

@Injectable()
export class SessionStoreProvider {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private configService: ConfigService) {}

  private store: session.Store;

  init() {
    const config = this.configService.get<ClientOpts>('redis');

    if (!config || !config.host) {
      this.store = new DefaultStore();
      return;
    }

    const redisClient = redis.createClient(config);

    /**
     * https://github.com/NodeRedis/node-redis#connection-and-other-events
     */
    redisClient.on('connect', () => {
      this.logger.log('Redis connecting...');
    });
    redisClient.on('ready', () => {
      this.logger.log('Redis connection ready');
    });
    redisClient.on('reconnecting', (connectParams: ClientOpts) => {
      this.logger.log('Redis reconnecting...');
      this.logger.debug(JSON.stringify(connectParams));
    });
    redisClient.on('warning', (message: string) => {
      this.logger.warn(message);
    });
    redisClient.on('error', (error: Error) => {
      this.logger.error(error.message, error.stack);
    });
    redisClient.on('end', () => {
      this.logger.log('Redis connection end');
    });

    /**
     * https://github.com/tj/connect-redis#redisstoreoptions
     */
    this.store = new RedisStore({ client: redisClient });
  }

  get(): session.Store {
    if (this.store === undefined) {
      this.init();
    }
    return this.store;
  }
}
