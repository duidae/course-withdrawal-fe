import dotenv from 'dotenv';
import { ALL_ENTITIES } from '../entities';

dotenv.config();

const SisDbConfig = {
  type: 'postgres',
  host: process.env.SIS_DB_HOST,
  port: +(process.env.SIS_DB_PORT ?? '5432'),
  username: process.env.SIS_DB_USERNAME,
  password: process.env.SIS_DB_PASSWORD,
  database: process.env.SIS_DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: [...ALL_ENTITIES],
};

export default SisDbConfig;
