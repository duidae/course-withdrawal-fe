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
  term: string;
  courseName: string;
  courseId: string;
  withdrawalCount: number;
  enabled: boolean;
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
    const courseInfo = await this.getCourseInfo(courseId, user);
    const studentInfo = await this.getStudentInfo(studentId);
    const settings = await this.getWithdrawalSettings(courseId);

    let entity: CourseWithdrawal | null;
    try {
      entity = await this.courseWithdrawalRepository.findOneBy({ courseId, studentId });
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    const base = {
      courseName: user.courseName,
      sectionName: courseInfo.sectionName,
      teachers: courseInfo.teachers,
      studnetName: studentInfo.name,
      loginId: studentInfo.loginId,
      studentId,
      notice: settings.noticeDelta,
    };

    if (!entity) {
      return {
        ...base,
        status: this.getEffectiveStatus(settings, WithdrawalStatus.NotSubmitted),
      };
    }

    const reviewerName = entity.reviewerId
      ? await this.getReviewerName(entity.reviewerId)
      : undefined;

    return {
      ...base,
      status: this.getEffectiveStatus(settings, entity.status),
      reason: entity.reason,
      submittedAt: entity.createdAt,
      reviewComment: entity.reviewComment,
      reviewerName,
      reviewedAt: entity.reviewedAt,
    };
  }

  async getCourseWithdrawalSettings(): Promise<CourseWithdrawalSettingsInfo[]> {
    let settingsList: CourseWithdrawalSetting[];

    try {
      settingsList = await this.courseWithdrawalSettingRepository.find();
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    return Promise.all(
      settingsList.map(async (settings) => {
        const withdrawalCount = await this.getWithdrawalCount(settings.courseId);

        return {
          // TODO: get term/course name from canvas api
          term: `Mock Term ${settings.courseId}`,
          courseName: `Mock Course name ${settings.courseId}`,
          courseId: settings.courseId,
          withdrawalCount,
          enabled: settings.enabled,
        };
      }),
    );
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

  private async getWithdrawalCount(courseId: string): Promise<number> {
    try {
      return await this.courseWithdrawalRepository.count({ where: { courseId } });
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
    settings: CourseWithdrawalSetting,
    status: CourseWithdrawalStatus | typeof WithdrawalStatus.NotSubmitted,
  ): WithdrawalStatus {
    const isPending =
      status === CourseWithdrawalStatus.Pending ||
      status === WithdrawalStatus.NotSubmitted;

    if (!isPending) {
      return status;
    }

    if (!settings.enabled) {
      return WithdrawalStatus.NotEnabled;
    }

    const now = new Date();
    if (settings.startAt > now) {
      return WithdrawalStatus.NotStarted;
    }
    if (settings.endAt < now) {
      return WithdrawalStatus.Overdue;
    }

    return status;
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
