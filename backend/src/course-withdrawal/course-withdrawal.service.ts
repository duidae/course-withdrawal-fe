import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CanvasApiService,
  /*
  EnrollmentType,
  ResourceName,
  */
} from '@ntucool/nestjs-canvas-api';
import { Repository } from 'typeorm';
import { type LtiAuthUser } from '../auth/models/lti-auth-user.model';
import { CourseWithdrawalDbName } from '../database/course-withdrawal-db/config/db.config';
import { CourseWithdrawal } from '../database/course-withdrawal-db/entities/course-withdrawal.entity';
import { CourseWithdrawalSetting } from '../database/course-withdrawal-db/entities/course-withdrawal-settings.entity';
import { CourseWithdrawalStatus } from '../database/course-withdrawal-db/entities/course-withdrawal-status.enum';
import {
  //CanvasApiError,
  DbError,
  InvalidInputError,
  NotFoundError,
} from '../shared/errors';

export const WithdrawalStatus = {
  ...CourseWithdrawalStatus,
  NotSubmitted: 'notSubmitted',
  NotStarted: 'notStarted',
  NotEnabled: 'notEnabled',
  Overdue: 'overdue',
} as const;

export type WithdrawalStatus = (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus];

export type Withdrawal = {
  status: WithdrawalStatus;
  courseName?: string;
  sectionName?: string;
  teachers?: string[];
  studnetName?: string;
  loginId?: string;
  studentId?: string;
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

  async getCourseInfo(courseId: string, user: LtiAuthUser): Promise<CourseInfo> {
    return Promise.resolve({
      sectionName: `Mock Section name ${courseId} ${user.courseName}`,
      teachers: [`Mock Teacher 1`, `Mock Teacher 2`],
    });
    /*
    try {
      const enrollments = await this.canvasApiService.enrollments.list({
        contextName: ResourceName.Course,
        contextId: courseId,
        parameters: { userId: user.canvasUserId },
      });
      const sectionId = enrollments[0]?.courseSectionId;
      const section = sectionId
        ? await this.canvasApiService.sections.get(sectionId)
        : undefined;

      const teachers = await this.canvasApiService.users.list({
        contextName: ResourceName.Course,
        contextId: courseId,
        parameters: { enrollmentType: [EnrollmentType.TeacherEnrollment] },
      });

      return {
        sectionName: section?.name ?? '',
        teachers: teachers.map((teacher) => teacher.name),
      };
    } catch (error) {
      throw new CanvasApiError((error as Error).message);
    }
    */
  }

  async getStudentInfo(
    userId: string,
  ): Promise<{ name: string; loginId: string; studentId: string }> {
    return Promise.resolve({
      name: `Mock Student name ${userId}`,
      loginId: `Mock Student loginId ${userId}`,
      studentId: `Mock Student studentId ${userId}`,
    });
    /*
    try {
      const user = await this.canvasApiService.users.get(userId);
      // TODO: get student info in external db
      return { name: user.name, loginId: user.loginId };
    } catch (error) {
      throw new CanvasApiError((error as Error).message);
    }
    */
  }

  async getReviewerName(reviewerId: string): Promise<string | undefined> {
    try {
      const reviewer = await this.canvasApiService.users.get(reviewerId);
      return reviewer.name;
    } catch (error) {
      console.error('Failed to get reviewer name:', (error as Error).message);
      return undefined;
      //TODO: check throw error or just return undefined
      //throw new CanvasApiError((error as Error).message);
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
    user: LtiAuthUser,
  ): Promise<Withdrawal> {
    let courseInfo;
    let studentInfo;
    let settings: CourseWithdrawalSetting | null;
    let withdrawalEntity: CourseWithdrawal | null;

    try {
      courseInfo = await this.getCourseInfo(courseId, user);
      studentInfo = await this.getStudentInfo(studentId);
      settings = await this.courseWithdrawalSettingRepository.findOneBy({ courseId });
      withdrawalEntity = await this.courseWithdrawalRepository.findOneBy({
        courseId,
        studentId,
      });
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    if (!courseInfo || !studentInfo || !settings) {
      throw new NotFoundError(
        'course info, student info, or withdrawal settings not found!',
      );
    }

    const withdrawal = {
      courseName: user.courseName,
      sectionName: courseInfo.sectionName,
      studnetName: studentInfo.name,
      loginId: studentInfo.loginId,
      studentId: studentId,
      teachers: courseInfo.teachers,
      notice: settings.noticeDelta,
    };

    if (!settings.enabled) {
      return {
        ...withdrawal,
        status: WithdrawalStatus.NotEnabled,
      };
    }

    const now = new Date();
    if (settings.startAt > now) {
      return {
        ...withdrawal,
        status: WithdrawalStatus.NotStarted,
      };
    }

    if (settings.endAt < now) {
      return {
        ...withdrawal,
        status: WithdrawalStatus.Overdue,
      };
    }

    if (!withdrawalEntity) {
      return {
        ...withdrawal,
        status: WithdrawalStatus.NotSubmitted,
      };
    }

    const reviewerName = withdrawalEntity.reviewerId
      ? await this.getReviewerName(withdrawalEntity.reviewerId)
      : undefined;

    return {
      status: withdrawalEntity.status,
      ...withdrawal,
      reason: withdrawalEntity.reason,
      submittedAt: withdrawalEntity.createdAt,
      reviewComment: withdrawalEntity.reviewComment,
      reviewerName,
      reviewedAt: withdrawalEntity.reviewedAt,
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
    user: LtiAuthUser,
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
      return { ...this.toWithdrawal(saved), courseName: user.courseName };
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
