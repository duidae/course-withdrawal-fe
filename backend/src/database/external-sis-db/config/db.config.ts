import { registerAs } from '@nestjs/config';
import ExternalSisDbConfig from './orm.config';

export const ExternalSisDbName = 'external-sis-db';

export const ExternalSisDbConfigFactory = registerAs(
  'externalSisDb',
  () => ExternalSisDbConfig,
);
