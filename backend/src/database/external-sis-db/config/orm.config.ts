import dotenv from 'dotenv';

dotenv.config();
const isTsNode = (process as unknown as Record<symbol, unknown>)[
  Symbol.for('ts-node.register.instance')
];

const ExternalSisDbConfig = {
  type: 'postgres',
  host: process.env.EXTERNAL_SIS_DB_HOST,
  port: +(process.env.EXTERNAL_SIS_DB_PORT ?? '5432'),
  username: process.env.EXTERNAL_SIS_DB_USERNAME,
  password: process.env.EXTERNAL_SIS_DB_PASSWORD,
  database: process.env.EXTERNAL_SIS_DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: [
    `${
      isTsNode
        ? 'src/database/external-sis-db/entities/*.entity.ts'
        : 'dist/database/external-sis-db/entities/*.entity.js'
    }`,
  ],
};

export default ExternalSisDbConfig;
