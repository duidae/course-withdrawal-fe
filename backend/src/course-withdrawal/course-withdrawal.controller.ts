import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import type {
  CourseInfo,
  CreateWithdrawalInput,
  PaginatedResult,
  Withdrawal,
} from './course-withdrawal.service';

import { CourseWithdrawalService } from './course-withdrawal.service';

@Controller('api')
export class CourseWithdrawalController {
  constructor(private readonly courseWithdrawalService: CourseWithdrawalService) {}

  @Get('withdrawal-list')
  getWithdrawals(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ): Promise<PaginatedResult<Withdrawal>> {
    return this.courseWithdrawalService.getWithdrawals(Number(page), Number(pageSize));
  }

  @Get('withdrawal/:id')
  getStudent(@Param('id') id: string): Promise<Withdrawal> {
    return this.courseWithdrawalService.getStudent(id);
  }

  @Get('courses/:courseId')
  getCourseInfo(@Param('courseId') courseId: string): CourseInfo {
    return this.courseWithdrawalService.getCourseInfo(courseId);
  }

  @Post('courses/:courseId/students/:studentId/withdrawal')
  createWithdrawal(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @Body() body: CreateWithdrawalInput,
  ): Promise<Withdrawal> {
    return this.courseWithdrawalService.createWithdrawal(courseId, studentId, body);
  }
}
