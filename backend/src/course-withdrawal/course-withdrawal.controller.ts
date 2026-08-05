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
import { RoleType } from '@ntucool/nestjs-canvas-api';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { type LtiAuthUser } from '../auth/models/lti-auth-user.model';
import { AdminCourseWithdrawalService } from './admin-course-withdrawal.service';
import type {
  BatchReviewResult,
  BatchReviewWithdrawalInput,
  CourseWithdrawalSettingsDetail,
  CourseWithdrawalSettingsInfo,
  CreateCourseWithdrawalSettingsInput,
  CreateWithdrawalInput,
  PaginatedResult,
  ReviewWithdrawalInput,
  UpdateCourseWithdrawalSettingsInput,
  Withdrawal,
} from './course-withdrawal.types';
import { StudentCourseWithdrawalService } from './student-course-withdrawal.service';
import { TeacherCourseWithdrawalService } from './teacher-course-withdrawal.service';

@Controller('api')
@UseGuards(CanvasLmsAuthGuard, RolesGuard)
export class CourseWithdrawalController {
  constructor(
    private readonly studentCourseWithdrawalService: StudentCourseWithdrawalService,
    private readonly teacherCourseWithdrawalService: TeacherCourseWithdrawalService,
    private readonly adminCourseWithdrawalService: AdminCourseWithdrawalService,
  ) {}

  @Get('courses/:courseId/withdrawal')
  @Roles(RoleType.StudentEnrollment)
  getWithdrawal(
    @Param('courseId') courseId: string,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.studentCourseWithdrawalService.getWithdrawal(Number(courseId), user);
  }

  @Post('courses/:courseId/withdrawal')
  @Roles(RoleType.StudentEnrollment)
  createWithdrawal(
    @Param('courseId') courseId: string,
    @Body() body: CreateWithdrawalInput,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.studentCourseWithdrawalService.createWithdrawal(
      Number(courseId),
      body,
      user,
    );
  }

  @Get('courses/:courseId/withdrawal-list')
  @Roles(RoleType.TeacherEnrollment, RoleType.TaEnrollment)
  getWithdrawals(
    @Param('courseId') courseId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ): Promise<PaginatedResult<Withdrawal>> {
    return this.teacherCourseWithdrawalService.getWithdrawals(
      Number(courseId),
      Number(page),
      Number(pageSize),
    );
  }

  @Patch('courses/:courseId/students/:studentCanvasId/withdrawal')
  @Roles(RoleType.TeacherEnrollment, RoleType.TaEnrollment)
  reviewWithdrawal(
    @Param('courseId') courseId: string,
    @Param('studentCanvasId') studentCanvasId: string,
    @Body() body: ReviewWithdrawalInput,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.teacherCourseWithdrawalService.reviewWithdrawal(
      Number(courseId),
      studentCanvasId,
      body,
      user,
    );
  }

  @Patch('courses/:courseId/withdrawals/batch-review')
  @Roles(RoleType.TeacherEnrollment, RoleType.TaEnrollment)
  batchReviewWithdrawals(
    @Param('courseId') courseId: string,
    @Body() body: BatchReviewWithdrawalInput,
    @User() user: LtiAuthUser,
  ): Promise<BatchReviewResult[]> {
    return this.teacherCourseWithdrawalService.batchReviewWithdrawals(
      Number(courseId),
      body,
      user,
    );
  }

  @Get('admin/courses')
  @Roles(RoleType.AccountAdmin)
  getCourses(): Promise<CourseWithdrawalSettingsInfo[]> {
    return this.adminCourseWithdrawalService.getCourseWithdrawalSettings();
  }

  @Post('admin/courses/:courseId')
  @Roles(RoleType.AccountAdmin)
  createCourseWithdrawalSettings(
    @Param('courseId') courseId: string,
    @Body() body: CreateCourseWithdrawalSettingsInput,
    @User() user: LtiAuthUser,
  ): Promise<CourseWithdrawalSettingsDetail> {
    return this.adminCourseWithdrawalService.createCourseWithdrawalSettings(
      Number(courseId),
      body,
      user,
    );
  }

  @Patch('admin/courses/:courseId')
  @Roles(RoleType.AccountAdmin)
  updateCourseWithdrawalSettings(
    @Param('courseId') courseId: string,
    @Body() body: UpdateCourseWithdrawalSettingsInput,
    @User() user: LtiAuthUser,
  ): Promise<CourseWithdrawalSettingsDetail> {
    return this.adminCourseWithdrawalService.updateCourseWithdrawalSettings(
      Number(courseId),
      body,
      user,
    );
  }
}
