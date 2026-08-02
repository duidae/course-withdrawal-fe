import { Module } from '@nestjs/common';

import { CourseWithdrawalController } from './course-withdrawal.controller';
import { CourseWithdrawalService } from './course-withdrawal.service';

@Module({
  controllers: [CourseWithdrawalController],
  providers: [CourseWithdrawalService],
})
export class CourseWithdrawalModule {}
