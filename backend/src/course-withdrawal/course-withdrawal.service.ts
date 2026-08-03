import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CourseWithdrawalDbName } from '../database/course-withdrawal-db/config/db.config';
import { CourseWithdrawal } from '../database/course-withdrawal-db/entities/course-withdrawal.entity';
import { DbError, NotFoundError } from '../shared/errors';

export type Withdrawal = {
  id: string;
  studentId: string;
  courseId: string;
  courseName?: string;
  studentName?: string;
  reason?: string;
  status?: string;
  applyTime?: string;
  deadline?: string;
};

export type CourseInfo = {
  courseName: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

@Injectable()
export class CourseWithdrawalService {
  constructor(
    @InjectRepository(CourseWithdrawal, CourseWithdrawalDbName)
    private readonly courseWithdrawalRepository: Repository<CourseWithdrawal>,
  ) {}

  // TODO: back this with a real courses table/service once one exists.
  private readonly courses: Array<{ courseId: string; courseName: string }> = [
    { courseId: 'CS101', courseName: '大型語言模型與資訊安全系統' },
    { courseId: 'CS102', courseName: '資料結構與演算法' },
  ];

  async getWithdrawals(page = 1, pageSize = 10): Promise<PaginatedResult<Withdrawal>> {
    try {
      const [entities, total] = await this.courseWithdrawalRepository.findAndCount({
        skip: (page - 1) * pageSize,
        take: pageSize,
        order: { createdDate: 'DESC' },
      });

      return {
        data: entities.map((entity) => this.toWithdrawal(entity)),
        total,
        page,
        pageSize,
      };
    } catch (error) {
      throw new DbError((error as Error).message);
    }
  }

  async getStudent(id: string): Promise<Withdrawal> {
    let entity: CourseWithdrawal | null;

    try {
      entity = await this.courseWithdrawalRepository.findOneBy({ id });
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    if (!entity) {
      throw new NotFoundError('withdrawal');
    }

    return this.toWithdrawal(entity);
  }

  getCourseInfo(courseId: string): CourseInfo {
    const course = this.courses.find((entry) => entry.courseId === courseId);
    return { courseName: course?.courseName ?? '' };
  }

  private toWithdrawal(entity: CourseWithdrawal): Withdrawal {
    return {
      id: entity.id,
      studentId: entity.studentId,
      courseId: entity.courseId,
      courseName: entity.courseName,
      studentName: entity.studentName,
      reason: entity.reason,
      status: entity.status,
      applyTime: entity.applyTime?.toISOString(),
      deadline: entity.deadline?.toISOString(),
    };
  }
}
