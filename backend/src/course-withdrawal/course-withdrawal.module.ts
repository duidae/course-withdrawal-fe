import { Module } from '@nestjs/common';

import { CanvasApiModule } from '../canvas-api/canvas-api.module';
import { CourseWithdrawalDbModule } from '../database/course-withdrawal-db/course-withdrawal-db.module';
import { ExternalSisDbModule } from '../database/external-sis-db/external-sis-db.module';
import { AdminCourseWithdrawalService } from './admin-course-withdrawal.service';
import { CourseWithdrawalCommonService } from './course-withdrawal-common.service';
import { CourseWithdrawalController } from './course-withdrawal.controller';
import { StudentCourseWithdrawalService } from './student-course-withdrawal.service';
import { TeacherCourseWithdrawalService } from './teacher-course-withdrawal.service';

@Module({
  imports: [CourseWithdrawalDbModule, ExternalSisDbModule, CanvasApiModule],
  controllers: [CourseWithdrawalController],
  providers: [
    CourseWithdrawalCommonService,
    StudentCourseWithdrawalService,
    TeacherCourseWithdrawalService,
    AdminCourseWithdrawalService,
  ],
})
export class CourseWithdrawalModule {}
