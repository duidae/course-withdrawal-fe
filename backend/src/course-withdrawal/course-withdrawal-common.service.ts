import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CanvasApiService,
  /*
  EnrollmentType,
  ResourceName
  */
} from '@ntucool/nestjs-canvas-api';
import { Repository } from 'typeorm';
import { type LtiAuthUser } from '../auth/models/lti-auth-user.model';
import { CourseWithdrawalDbName } from '../database/course-withdrawal-db/config/db.config';
import { CourseWithdrawal } from '../database/course-withdrawal-db/entities/course-withdrawal.entity';
import { CourseWithdrawalSetting } from '../database/course-withdrawal-db/entities/course-withdrawal-settings.entity';
import { CourseWithdrawalStatus } from '../database/course-withdrawal-db/entities/course-withdrawal-status.enum';
import { ExternalSisDbName } from '../database/external-sis-db/config/db.config';
import { ExternalStudent } from '../database/external-sis-db/entities/external-student.entity';
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
    @InjectRepository(ExternalStudent, ExternalSisDbName)
    private readonly externalStudentRepository: Repository<ExternalStudent>,
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

  async getStudentId(loginId: string): Promise<string> {
    let externalStudent: ExternalStudent | null;
    try {
      externalStudent = await this.externalStudentRepository.findOne({
        where: { loginId },
        relations: ['school'],
      });
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    if (!externalStudent) {
      throw new NotFoundError('external student');
    }

    return `${externalStudent.school.abbr}_${externalStudent.regNo}`;
  }

  async getStudentInfo(userId: number): Promise<{
    name: string;
    loginId: string;
    studentId: string;
  }> {
    let user;
    try {
      user = await this.canvasApiService.users.get(userId);
    } catch (error) {
      throw new CanvasApiError((error as Error).message);
    }

    const studentId = await this.getStudentId(user.loginId);

    return { name: user.name, loginId: user.loginId, studentId };
  }

  async getReviewerName(reviewerId: number): Promise<string | undefined> {
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
