import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import type {
  CreateWithdrawalInput,
  PaginatedResult,
  Withdrawal,
} from './course-withdrawal.service';

import { CourseWithdrawalService } from './course-withdrawal.service';

@Controller('api')
export class CourseWithdrawalController {
  constructor(private readonly courseWithdrawalService: CourseWithdrawalService) {}

  @Get('courses/:courseId/withdrawal-list')
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
  ): Promise<Withdrawal> {
    return this.courseWithdrawalService.getWithdrawal(courseId, studentId);
  }

  @Post('courses/:courseId/students/:studentId/withdrawal')
  createWithdrawal(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @Body() body: CreateWithdrawalInput,
  ): Promise<Withdrawal> {
    return this.courseWithdrawalService.createWithdrawal(courseId, studentId, body);
  }

  /* TODO: admin part
  @Get('courses/:courseId')
  getCourse(@Param('courseId') courseId: string): CourseInfo {
    return this.courseWithdrawalService.getCourse(courseId);
  }
  */
}
