import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CanvasApiService } from '@ntucool/nestjs-canvas-api';
import { Repository } from 'typeorm';

import { CourseWithdrawalDbName } from '../database/course-withdrawal-db/config/db.config';
import { CourseWithdrawal } from '../database/course-withdrawal-db/entities/course-withdrawal.entity';
import { CourseWithdrawalStatus } from '../database/course-withdrawal-db/entities/course-withdrawal-status.enum';
import {
  CanvasApiError,
  DbError,
  InvalidInputError,
  NotFoundError,
} from '../shared/errors';

export type Withdrawal = {
  id: string;
  studentId: string;
  courseId: string;
  reason?: string;
  status?: string;
  reviewerId?: string;
  reviewComment?: string;
};

export type CreateWithdrawalInput = {
  reason: string;
  studentName?: string;
  courseName?: string;
};

export type CourseInfo = {
  courseName: string;
};

export type UserInfo = {
  name: string;
  loginId: string;
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
    private readonly canvasApiService: CanvasApiService,
  ) {}

  async getCourseInfo(courseId: string): Promise<CourseInfo> {
    try {
      const course = await this.canvasApiService.courses.get(courseId);
      return { courseName: course.name };
    } catch (error) {
      throw new CanvasApiError((error as Error).message);
    }
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    try {
      const user = await this.canvasApiService.users.get(userId);
      return { name: user.name, loginId: user.loginId };
    } catch (error) {
      throw new CanvasApiError((error as Error).message);
    }
  }

  // TODO: get user info in external db

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
        order: { createdAt: 'DESC' },
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
        reason: input.reason,
        status: CourseWithdrawalStatus.Pending,
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
      reason: entity.reason,
      status: entity.status,
      reviewerId: entity.reviewerId,
      reviewComment: entity.reviewComment,
    };
  }
}
