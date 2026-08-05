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

  @Get('courses/:courseId/withdrawal')
  getWithdrawal(
    @Param('courseId') courseId: string,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.studentCourseWithdrawalService.getWithdrawal(courseId, user);
  }

  @Post('courses/:courseId/withdrawal')
  createWithdrawal(
    @Param('courseId') courseId: string,
    @Body() body: CreateWithdrawalInput,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.studentCourseWithdrawalService.createWithdrawal(courseId, body, user);
  }

  @Get('courses/:courseId/withdrawal-list')
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

  @Patch('courses/:courseId/students/:studentCanvasId/withdrawal')
  reviewWithdrawal(
    @Param('courseId') courseId: string,
    @Param('studentCanvasId') studentCanvasId: string,
    @Body() body: ReviewWithdrawalInput,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.teacherCourseWithdrawalService.reviewWithdrawal(
      courseId,
      studentCanvasId,
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

  @Get('admin/courses')
  getCourses(): Promise<CourseWithdrawalSettingsInfo[]> {
    return this.adminCourseWithdrawalService.getCourseWithdrawalSettings();
  }
}
