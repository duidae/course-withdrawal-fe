import { registerAs } from '@nestjs/config';
import SisDbConfig from './orm.config';

export const SisDbName = 'sis';

export const SisDbConfigFactory = registerAs('sisDb', () => SisDbConfig);
