import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CanvasApiService } from '@ntucool/nestjs-canvas-api';
import { Repository } from 'typeorm';

import { CourseWithdrawalDbName } from '../database/course-withdrawal-db/config/db.config';
import { CourseWithdrawal } from '../database/course-withdrawal-db/entities/course-withdrawal.entity';
import { CourseWithdrawalSetting } from '../database/course-withdrawal-db/entities/course-withdrawal-settings.entity';
import { CourseWithdrawalStatus } from '../database/course-withdrawal-db/entities/course-withdrawal-status.enum';
import {
  CanvasApiError,
  DbError,
  InvalidInputError,
  NotFoundError,
} from '../shared/errors';

export const WithdrawalStatus = {
  ...CourseWithdrawalStatus,
  NotSubmitted: 'notSubmitted',
  Overdue: 'overdue',
} as const;

export type WithdrawalStatus = (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus];

export type Withdrawal = {
  id?: string;
  studentId: string;
  courseId: string;
  reason?: string;
  status: WithdrawalStatus;
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
  section: string;
  teachers: string[];
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
    @InjectRepository(CourseWithdrawalSetting, CourseWithdrawalDbName)
    private readonly courseWithdrawalSettingRepository: Repository<CourseWithdrawalSetting>,
    private readonly canvasApiService: CanvasApiService,
  ) {}

  getCourseInfo(courseId: string): Promise<CourseInfo> {
    return Promise.resolve({
      courseName: `Mock Course ${courseId}`,
      section: `Mock Section ${courseId}`,
      teachers: [`Mock Teacher 1`, `Mock Teacher 2`],
    });

    // TODO: get course info from canvas api
    // try {
    //   const course = await this.canvasApiService.courses.get(courseId);
    //   return { courseName: course.name };
    // } catch (error) {
    //   throw new CanvasApiError((error as Error).message);
    // }
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
    const settings = await this.getSettingsOrThrow(courseId);

    let entity: CourseWithdrawal | null;

    try {
      entity = await this.courseWithdrawalRepository.findOneBy({ courseId, studentId });
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    if (!entity) {
      return { studentId, courseId, status: WithdrawalStatus.NotSubmitted };
    }

    return {
      ...this.toWithdrawal(entity),
      status: this.getEffectiveStatus(entity.status, settings),
    };
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

  private async getSettingsOrThrow(courseId: string): Promise<CourseWithdrawalSetting> {
    let settings: CourseWithdrawalSetting | null;

    try {
      settings = await this.courseWithdrawalSettingRepository.findOneBy({ courseId });
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    if (!settings) {
      throw new NotFoundError('course withdrawal settings');
    }

    return settings;
  }

  private getEffectiveStatus(
    status: CourseWithdrawalStatus,
    settings: CourseWithdrawalSetting,
  ): WithdrawalStatus {
    if (status !== CourseWithdrawalStatus.Pending) {
      return status;
    }

    const isExpired = !settings.enabled || settings.endAt < new Date();
    return isExpired ? WithdrawalStatus.Overdue : WithdrawalStatus.Pending;
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
