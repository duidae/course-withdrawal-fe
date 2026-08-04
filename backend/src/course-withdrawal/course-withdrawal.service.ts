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
  status: WithdrawalStatus;
  courseName?: string;
  sectionName?: string;
  teachers?: string[];
  reason?: string;
  submittedAt?: Date;
  reviewComment?: string;
  reviewerName?: string;
  reviewedAt?: Date;
  notice?: object;
};

export type CreateWithdrawalInput = {
  reason: string;
  studentName?: string;
  courseName?: string;
};

export type CourseInfo = {
  sectionName: string;
  teachers: string[];
};

export type CourseWithdrawalSettingsInfo = {
  courseName: string;
  startAt: Date;
  endAt: Date;
  enabled: boolean;
  notice?: object;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- studentId will be used once section/teacher lookup calls the Canvas API
  getCourseInfo(courseId: string, studentId: string): Promise<CourseInfo> {
    return Promise.resolve({
      sectionName: `Mock Section name ${courseId}`,
      teachers: [`Mock Teacher 1`, `Mock Teacher 2`],
    });

    // TODO: get section/teachers info from canvas api
    //  /api/v1/courses/:course_id/enrollments?user_id=:user_id => course_section_id
    // /api/v1/sections/:section_id => section name
    // teachers: /api/v1/courses/:course_id/users?enrollment_type[]=teacher
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    try {
      const user = await this.canvasApiService.users.get(userId);
      return { name: user.name, loginId: user.loginId };
    } catch (error) {
      throw new CanvasApiError((error as Error).message);
    }
  }

  async getReviewerName(reviewerId: string): Promise<string> {
    try {
      const reviewer = await this.canvasApiService.users.get(reviewerId);
      return reviewer.name;
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

  async getWithdrawal(
    courseId: string,
    studentId: string,
    courseName: string,
  ): Promise<Withdrawal> {
    const courseInfo = await this.getCourseInfo(courseId, studentId);
    const settings = await this.getWithdrawalSettings(courseId);

    let entity: CourseWithdrawal | null;

    try {
      entity = await this.courseWithdrawalRepository.findOneBy({ courseId, studentId });
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    if (!entity) {
      return {
        status: WithdrawalStatus.NotSubmitted,
        courseName,
        sectionName: courseInfo.sectionName,
        teachers: courseInfo.teachers,
        notice: settings.noticeDelta,
      };
    }

    const reviewerName = entity.reviewerId
      ? await this.getReviewerName(entity.reviewerId)
      : undefined;

    return {
      status: this.getEffectiveStatus(entity.status, settings),
      courseName,
      sectionName: courseInfo.sectionName,
      teachers: courseInfo.teachers,
      reason: entity.reason,
      submittedAt: entity.createdAt,
      reviewComment: entity.reviewComment,
      reviewerName,
      reviewedAt: entity.reviewedAt,
      notice: settings.noticeDelta,
    };
  }

  async getCourseWithdrawalSettings(
    courseId: string,
    courseName: string,
  ): Promise<CourseWithdrawalSettingsInfo> {
    const settings = await this.getWithdrawalSettings(courseId);

    return {
      courseName,
      startAt: settings.startAt,
      endAt: settings.endAt,
      enabled: settings.enabled,
      notice: settings.noticeDelta,
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

  private async getWithdrawalSettings(
    courseId: string,
  ): Promise<CourseWithdrawalSetting> {
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
      status: entity.status,
      reason: entity.reason,
      reviewComment: entity.reviewComment,
      reviewedAt: entity.reviewedAt,
      submittedAt: entity.createdAt,
    };
  }
}
