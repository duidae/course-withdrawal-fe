import { Module } from '@nestjs/common';

import { CanvasApiModule } from '../canvas-api/canvas-api.module';
import { CourseWithdrawalDbModule } from '../database/course-withdrawal-db/course-withdrawal-db.module';
import { CourseWithdrawalController } from './course-withdrawal.controller';
import { CourseWithdrawalService } from './course-withdrawal.service';

@Module({
  imports: [CourseWithdrawalDbModule, CanvasApiModule],
  controllers: [CourseWithdrawalController],
  providers: [CourseWithdrawalService],
})
export class CourseWithdrawalModule {}
