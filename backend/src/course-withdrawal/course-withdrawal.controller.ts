import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CanvasLmsAuthGuard } from '@ntucool/nestjs-canvas-lms-auth/dist/canvas-lms-auth.guard';
import { User } from '@ntucool/nestjs-canvas-lms-auth';
import { Permissions } from '../auth/decorators/permission.decorator';
import { Permission } from '../auth/models/enums/permission.enum';
import { type LtiAuthUser } from '../auth/models/lti-auth-user.model';
import { AdminCourseWithdrawalService } from './admin-course-withdrawal.service';
import type {
  BatchReviewResult,
  BatchReviewWithdrawalInput,
  CourseWithdrawalSettingsInfo,
  CreateWithdrawalInput,
  PaginatedResult,
  ReviewWithdrawalInput,
  Withdrawal,
} from './course-withdrawal.types';
import { StudentCourseWithdrawalService } from './student-course-withdrawal.service';
import { TeacherCourseWithdrawalService } from './teacher-course-withdrawal.service';

@Controller('api')
@UseGuards(CanvasLmsAuthGuard)
export class CourseWithdrawalController {
  constructor(
    private readonly studentCourseWithdrawalService: StudentCourseWithdrawalService,
    private readonly teacherCourseWithdrawalService: TeacherCourseWithdrawalService,
    private readonly adminCourseWithdrawalService: AdminCourseWithdrawalService,
  ) {}

  @Get('courses/:courseId/withdrawal-list')
  @Permissions(['courseId', Permission.GeneralView])
  getWithdrawals(
    @Param('courseId') courseId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ): Promise<PaginatedResult<Withdrawal>> {
    return this.teacherCourseWithdrawalService.getWithdrawals(
      courseId,
      Number(page),
      Number(pageSize),
    );
  }

  @Get('courses/:courseId/students/:studentId/withdrawal')
  getWithdrawal(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.studentCourseWithdrawalService.getWithdrawal(courseId, studentId, user);
  }

  @Post('courses/:courseId/students/:studentId/withdrawal')
  createWithdrawal(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @Body() body: CreateWithdrawalInput,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.studentCourseWithdrawalService.createWithdrawal(
      courseId,
      studentId,
      body,
      user,
    );
  }

  @Patch('courses/:courseId/students/:studentId/withdrawal')
  reviewWithdrawal(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @Body() body: ReviewWithdrawalInput,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.teacherCourseWithdrawalService.reviewWithdrawal(
      courseId,
      studentId,
      body,
      user,
    );
  }

  @Patch('courses/:courseId/withdrawals/batch-review')
  batchReviewWithdrawals(
    @Param('courseId') courseId: string,
    @Body() body: BatchReviewWithdrawalInput,
    @User() user: LtiAuthUser,
  ): Promise<BatchReviewResult[]> {
    return this.teacherCourseWithdrawalService.batchReviewWithdrawals(
      courseId,
      body,
      user,
    );
  }

  @Get('/admin-list')
  getCourses(): Promise<CourseWithdrawalSettingsInfo[]> {
    return this.adminCourseWithdrawalService.getCourseWithdrawalSettings();
  }
}
