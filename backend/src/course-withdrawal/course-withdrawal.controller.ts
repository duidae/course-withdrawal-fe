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
import type {
  CourseWithdrawalSettingsInfo,
  CreateWithdrawalInput,
  PaginatedResult,
  ReviewWithdrawalInput,
  Withdrawal,
} from './course-withdrawal.service';

import { CourseWithdrawalService } from './course-withdrawal.service';

@Controller('api')
@UseGuards(CanvasLmsAuthGuard)
export class CourseWithdrawalController {
  constructor(private readonly courseWithdrawalService: CourseWithdrawalService) {}

  @Get('courses/:courseId/withdrawal-list')
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

  @Get('courses/:courseId/students/:studentId/withdrawal')
  getWithdrawal(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.courseWithdrawalService.getWithdrawal(courseId, studentId, user);
  }

  @Post('courses/:courseId/students/:studentId/withdrawal')
  createWithdrawal(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @Body() body: CreateWithdrawalInput,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.courseWithdrawalService.createWithdrawal(courseId, studentId, body, user);
  }

  @Patch('courses/:courseId/students/:studentId/withdrawal')
  reviewWithdrawal(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @Body() body: ReviewWithdrawalInput,
    @User() user: LtiAuthUser,
  ): Promise<Withdrawal> {
    return this.courseWithdrawalService.reviewWithdrawal(courseId, studentId, body, user);
  }

  @Get('/admin-list')
  getCourses(): Promise<CourseWithdrawalSettingsInfo[]> {
    return this.courseWithdrawalService.getCourseWithdrawalSettings();
  }
}
