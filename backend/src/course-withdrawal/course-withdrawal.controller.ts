import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CanvasLmsAuthGuard } from '@ntucool/nestjs-canvas-lms-auth/dist/canvas-lms-auth.guard';
import { User } from '@ntucool/nestjs-canvas-lms-auth';
import { Permissions } from '../auth/decorators/permission.decorator';
import { Permission } from '../auth/models/enums/permission.enum';
import { type LtiAuthUser } from '../auth/models/lti-auth-user.model';
import type {
  CourseWithdrawalSettingsInfo,
  CreateWithdrawalInput,
  PaginatedResult,
  Withdrawal,
} from './course-withdrawal.service';

import { CourseWithdrawalService } from './course-withdrawal.service';

@Controller('api/courses/:courseId')
@UseGuards(CanvasLmsAuthGuard)
export class CourseWithdrawalController {
  constructor(private readonly courseWithdrawalService: CourseWithdrawalService) {}

  @Get('withdrawal-list')
  @Permissions(['courseId', Permission.GeneralView])
  getWithdrawals(
    @Param('courseId') courseId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ): Promise<PaginatedResult<Withdrawal>> {
    return this.courseWithdrawalService.getWithdrawals(
      courseId,
      Number(page),
      Number(pageSize),
    );
  }

  @Get('students/:studentId/withdrawal')
  getWithdrawal(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.courseWithdrawalService.getWithdrawal(courseId, studentId, user);
  }

  @Post('students/:studentId/withdrawal')
  createWithdrawal(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @Body() body: CreateWithdrawalInput,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.courseWithdrawalService.createWithdrawal(courseId, studentId, body, user);
  }

  @Get('/admin')
  getCourse(
    @Param('courseId') courseId: string,
    @User() user: LtiAuthUser,
  ): Promise<CourseWithdrawalSettingsInfo> {
    return this.courseWithdrawalService.getCourseWithdrawalSettings(
      courseId,
      user.courseName,
    );
  }
}
