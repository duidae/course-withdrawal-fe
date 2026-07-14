import { registerAs } from '@nestjs/config';
import CourseWithdrawalDbConfig from './orm.config';

export const CourseWithdrawalDbName = 'course_withdrawal';

export const CourseWithdrawalDbConfigFactory = registerAs(
  'courseWithdrawalDb',
  () => CourseWithdrawalDbConfig,
);
