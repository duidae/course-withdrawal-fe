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
import { CanvasApiError, DbError, NotFoundError } from '../shared/errors';
import {
  type CourseInfo,
  type Withdrawal,
  WithdrawalStatus,
} from './course-withdrawal.types';

@Injectable()
export class CourseWithdrawalCommonService {
  constructor(
    @InjectRepository(CourseWithdrawal, CourseWithdrawalDbName)
    private readonly courseWithdrawalRepository: Repository<CourseWithdrawal>,
    @InjectRepository(CourseWithdrawalSetting, CourseWithdrawalDbName)
    private readonly courseWithdrawalSettingRepository: Repository<CourseWithdrawalSetting>,
    private readonly canvasApiService: CanvasApiService,
  ) {}

  async getCourseInfo(courseId: number, user: LtiAuthUser): Promise<CourseInfo> {
    return Promise.resolve({
      sectionId: courseId * 10 + 1,
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
        sectionId: sectionId ?? 0,
        sectionName: section?.name ?? '',
        teachers: teachers.map((teacher) => teacher.name),
      };
    } catch (error) {
      throw new CanvasApiError((error as Error).message);
    }
    */
  }

  async getStudentInfo(
    userId: number,
  ): Promise<{ name: string; loginId: string; studentId: string; sectionName: string }> {
    return Promise.resolve({
      name: `Mock Student name ${userId}`,
      loginId: `Mock Student loginId ${userId}`,
      studentId: `Mock Student studentId ${userId}`,
      sectionName: `Mock Section name ${userId}`,
    });
    /*
    try {
      const user = await this.canvasApiService.users.get(userId);
      // TODO: get student info (incl. section) in external db
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

  async getWithdrawalSettings(courseId: number): Promise<CourseWithdrawalSetting> {
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

  // Get derived status(NotEnabled/NotStarted/Overdue)
  // from Pending/Approved/Declined/NotSubmitted
  getEffectiveStatus(
    settings: CourseWithdrawalSetting,
    // status: Pending/Approved/Declined/NotSubmitted
    status: CourseWithdrawalStatus | typeof WithdrawalStatus.NotSubmitted,
  ): WithdrawalStatus {
    const canApply =
      status === CourseWithdrawalStatus.Pending ||
      status === WithdrawalStatus.NotSubmitted;

    // !canApply: Approved/Declined
    if (!canApply) {
      return status;
    }

    // Derived status: NotEnabled/NotStarted/Overdue
    const now = new Date();
    if (!settings.enabled) {
      return WithdrawalStatus.NotEnabled;
    }
    if (settings.startAt > now) {
      return WithdrawalStatus.NotStarted;
    }
    if (settings.endAt < now) {
      return WithdrawalStatus.Overdue;
    }

    return status;
  }

  toWithdrawal(entity: CourseWithdrawal): Withdrawal {
    return {
      status: entity.status,
      reason: entity.reason,
      reviewComment: entity.reviewComment,
      reviewedAt: entity.reviewedAt,
      submittedAt: entity.createdAt,
    };
  }

  async getCourseTermAndName(
    courseId: number,
  ): Promise<{ term: string; courseName: string }> {
    try {
      const course = await this.canvasApiService.courses.get(courseId, {
        parameters: { include: ['term'] },
      });
      return { term: course.term?.name ?? '', courseName: course.name };
    } catch (error) {
      throw new CanvasApiError((error as Error).message);
    }
  }

  async getWithdrawalCount(courseId: number): Promise<number> {
    try {
      return await this.courseWithdrawalRepository.count({ where: { courseId } });
    } catch (error) {
      throw new DbError((error as Error).message);
    }
  }
}
