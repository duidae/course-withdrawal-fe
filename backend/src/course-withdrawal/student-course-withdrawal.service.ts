import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type LtiAuthUser } from '../auth/models/lti-auth-user.model';
import { CourseWithdrawalDbName } from '../database/course-withdrawal-db/config/db.config';
import { CourseWithdrawal } from '../database/course-withdrawal-db/entities/course-withdrawal.entity';
import { CourseWithdrawalStatus } from '../database/course-withdrawal-db/entities/course-withdrawal-status.enum';
import { DbError, InvalidInputError } from '../shared/errors';
import { CourseWithdrawalCommonService } from './course-withdrawal-common.service';
import {
  type CreateWithdrawalInput,
  type Withdrawal,
  WithdrawalStatus,
} from './course-withdrawal.types';

@Injectable()
export class StudentCourseWithdrawalService {
  constructor(
    @InjectRepository(CourseWithdrawal, CourseWithdrawalDbName)
    private readonly courseWithdrawalRepository: Repository<CourseWithdrawal>,
    private readonly common: CourseWithdrawalCommonService,
  ) {}

  async getWithdrawal(courseId: number, user: LtiAuthUser): Promise<Withdrawal> {
    if (courseId !== user.courseId) {
      throw new InvalidInputError("courseId does not match the user's courseId");
    }

    if (!user.loginId) {
      throw new InvalidInputError('loginId is required for the user');
    }

    const courseInfo = await this.common.getCourseInfo(courseId, user);
    const studentId = await this.common.getStudentId(user.loginId);
    const settings = await this.common.getWithdrawalSettings(courseId);

    let entity: CourseWithdrawal | null;
    try {
      entity = await this.courseWithdrawalRepository.findOneBy({
        courseId,
        canvasUserId: user.canvasUserId,
      });
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    const base = {
      courseName: user.courseName,
      sectionName: courseInfo.sectionName,
      teachers: courseInfo.teachers,
      studentName: user.userName,
      loginId: user.loginId,
      studentId: studentId,
      notice: settings.noticeDelta,
    };

    if (!entity) {
      return {
        ...base,
        status: this.common.getEffectiveStatus(settings, WithdrawalStatus.NotSubmitted),
      };
    }

    const reviewerName = entity.reviewerId
      ? await this.common.getReviewerName(entity.reviewerId)
      : undefined;

    return {
      ...base,
      status: this.common.getEffectiveStatus(settings, entity.status),
      reason: entity.reason,
      submittedAt: entity.createdAt,
      reviewComment: entity.reviewComment,
      reviewerName,
      reviewedAt: entity.reviewedAt,
    };
  }

  async createWithdrawal(
    courseId: number,
    input: CreateWithdrawalInput,
    user: LtiAuthUser,
  ): Promise<Withdrawal> {
    if (!input.reason?.trim()) {
      throw new InvalidInputError('reason is required');
    }

    const courseInfo = await this.common.getCourseInfo(courseId, user);

    try {
      const entity = this.courseWithdrawalRepository.create({
        courseId,
        canvasUserId: user.canvasUserId,
        sectionId: courseInfo.sectionId,
        sectionName: courseInfo.sectionName,
        reason: input.reason,
        status: CourseWithdrawalStatus.Pending,
      });

      const saved = await this.courseWithdrawalRepository.save(entity);
      return { ...this.common.toWithdrawal(saved), courseName: user.courseName };
    } catch (error) {
      throw new DbError((error as Error).message);
    }
  }
}
