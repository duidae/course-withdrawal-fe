import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CourseWithdrawalDbName } from '../database/course-withdrawal-db/config/db.config';
import { CourseWithdrawal } from '../database/course-withdrawal-db/entities/course-withdrawal.entity';
import { DbError, InvalidInputError, NotFoundError } from '../shared/errors';

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
  reviewTime?: string;
  reviewer?: string;
  comment?: string;
};

export type CreateWithdrawalInput = {
  reason: string;
  studentName?: string;
  courseName?: string;
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

  async getWithdrawals(
    courseId: string,
    page = 1,
    pageSize = 10,
  ): Promise<PaginatedResult<Withdrawal>> {
    try {
      const [entities, total] = await this.courseWithdrawalRepository.findAndCount({
        where: { courseId },
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

  async getWithdrawal(courseId: string, studentId: string): Promise<Withdrawal> {
    let entity: CourseWithdrawal | null;

    try {
      entity = await this.courseWithdrawalRepository.findOneBy({ courseId, studentId });
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    if (!entity) {
      throw new NotFoundError('withdrawal');
    }

    return this.toWithdrawal(entity);
  }

  async createWithdrawal(
    courseId: string,
    studentId: string,
    input: CreateWithdrawalInput,
  ): Promise<Withdrawal> {
    if (!input.reason?.trim()) {
      throw new InvalidInputError('reason is required');
    }

    try {
      const entity = this.courseWithdrawalRepository.create({
        courseId,
        studentId,
        courseName: input.courseName,
        studentName: input.studentName,
        reason: input.reason,
        status: 'pending',
        applyTime: new Date(),
      });

      const saved = await this.courseWithdrawalRepository.save(entity);
      return this.toWithdrawal(saved);
    } catch (error) {
      throw new DbError((error as Error).message);
    }
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
      reviewTime: entity.reviewTime?.toISOString(),
      reviewer: entity.reviewer,
      comment: entity.comment,
    };
  }
}
