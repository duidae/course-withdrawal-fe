import { Controller, Get, Param, Query } from '@nestjs/common';
import type { CourseInfo, PaginatedResult, Withdrawal } from './course-withdrawal.service';

import { CourseWithdrawalService } from './course-withdrawal.service';

@Controller('api')
export class CourseWithdrawalController {
  constructor(private readonly courseWithdrawalService: CourseWithdrawalService) {}

  @Get('withdrawal-list')
  getWithdrawals(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ): PaginatedResult<Withdrawal> {
    return this.courseWithdrawalService.getWithdrawals(Number(page), Number(pageSize));
  }

  @Get('withdrawal/:id')
  getStudent(@Param('id') id: string): Withdrawal | undefined {
    return this.courseWithdrawalService.getStudent(Number(id));
  }

  @Get('courses/:courseId')
  getCourseInfo(@Param('courseId') courseId: string): CourseInfo {
    return this.courseWithdrawalService.getCourseInfo(courseId);
  }
}
