import dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenv.config();
const isTsNode = (process as unknown as Record<symbol, unknown>)[
  Symbol.for('ts-node.register.instance')
];

const CourseWithdrawalDbConfig = {
  type: 'postgres',
  host: process.env.COURSE_WITHDRAWAL_DB_HOST,
  port: +(process.env.COURSE_WITHDRAWAL_DB_PORT ?? '5432'),
  username: process.env.COURSE_WITHDRAWAL_DB_USERNAME,
  password: process.env.COURSE_WITHDRAWAL_DB_PASSWORD,
  database: process.env.COURSE_WITHDRAWAL_DB_DATABASE,
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    `${
      isTsNode
        ? 'src/database/course-withdrawal-db/entities/*.entity.ts'
        : 'dist/database/course-withdrawal-db/entities/*.entity.js'
    }`,
  ],
  migrations: [
    `${
      isTsNode
        ? 'src/database/course-withdrawal-db/migrations/*.ts'
        : 'dist/database/course-withdrawal-db/migrations/*.js'
    }`,
  ],
  cli: {
    migrationsDir: 'src/database/course-withdrawal-db/migrations',
  },
};

export default CourseWithdrawalDbConfig;
