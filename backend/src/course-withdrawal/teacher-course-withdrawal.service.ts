import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type LtiAuthUser } from '../auth/models/lti-auth-user.model';
import { CourseWithdrawalDbName } from '../database/course-withdrawal-db/config/db.config';
import { CourseWithdrawal } from '../database/course-withdrawal-db/entities/course-withdrawal.entity';
import { CourseWithdrawalSetting } from '../database/course-withdrawal-db/entities/course-withdrawal-settings.entity';
import { CourseWithdrawalStatus } from '../database/course-withdrawal-db/entities/course-withdrawal-status.enum';
import { DbError, InvalidInputError, NotFoundError } from '../shared/errors';
import { CourseWithdrawalCommonService } from './course-withdrawal-common.service';
import {
  type BatchReviewResult,
  type BatchReviewWithdrawalInput,
  type PaginatedResult,
  type ReviewWithdrawalInput,
  type Withdrawal,
} from './course-withdrawal.types';

const defaultPageSize = 10;

@Injectable()
export class TeacherCourseWithdrawalService {
  constructor(
    @InjectRepository(CourseWithdrawal, CourseWithdrawalDbName)
    private readonly courseWithdrawalRepository: Repository<CourseWithdrawal>,
    private readonly common: CourseWithdrawalCommonService,
  ) {}

  async getWithdrawals(
    courseId: number,
    page = 1,
    pageSize = defaultPageSize,
  ): Promise<PaginatedResult<Withdrawal>> {
    const settings = await this.common.getWithdrawalSettings(courseId);

    let entities: CourseWithdrawal[];
    let total: number;

    try {
      [entities, total] = await this.courseWithdrawalRepository.findAndCount({
        where: { courseId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    const data = await Promise.all(
      entities.map((entity) => this.toWithdrawalListItem(entity, settings)),
    );

    return { data, total, page, pageSize };
  }

  async reviewWithdrawal(
    courseId: number,
    studentCanvasId: string,
    input: ReviewWithdrawalInput,
    user: LtiAuthUser,
  ): Promise<Withdrawal> {
    if (!user) {
      throw new InvalidInputError('Invalid user');
    }

    if (
      input.status !== CourseWithdrawalStatus.Approved &&
      input.status !== CourseWithdrawalStatus.Declined
    ) {
      throw new InvalidInputError('status must be "approved" or "declined"');
    }

    let entity: CourseWithdrawal | null;
    try {
      entity = await this.courseWithdrawalRepository.findOneBy({
        courseId,
        canvasUserId: Number(studentCanvasId),
      });
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    if (!entity) {
      throw new NotFoundError('withdrawal');
    }

    try {
      entity.status = input.status;
      entity.reviewerId = user.canvasUserId;
      entity.reviewComment = input.reviewComment;
      entity.reviewedAt = new Date();

      const saved = await this.courseWithdrawalRepository.save(entity);
      return { ...this.common.toWithdrawal(saved), courseName: user.courseName };
    } catch (error) {
      throw new DbError((error as Error).message);
    }
  }

  async batchReviewWithdrawals(
    courseId: number,
    input: BatchReviewWithdrawalInput,
    user: LtiAuthUser,
  ): Promise<BatchReviewResult[]> {
    if (!input.studentCanvasIds?.length) {
      throw new InvalidInputError('studentCanvasIds must be a non-empty array');
    }

    return Promise.all(
      input.studentCanvasIds.map(async (studentCanvasId): Promise<BatchReviewResult> => {
        try {
          const withdrawal = await this.reviewWithdrawal(
            courseId,
            studentCanvasId,
            { status: input.status, reviewComment: input.reviewComment },
            user,
          );
          return { studentCanvasId, success: true, withdrawal };
        } catch (error) {
          return { studentCanvasId, success: false, error: (error as Error).message };
        }
      }),
    );
  }

  private async toWithdrawalListItem(
    entity: CourseWithdrawal,
    settings: CourseWithdrawalSetting,
  ): Promise<Withdrawal> {
    const [studentInfo, reviewerName] = await Promise.all([
      this.common.getStudentInfo(entity.canvasUserId),
      entity.reviewerId ? this.common.getReviewerName(entity.reviewerId) : undefined,
    ]);

    return {
      status: this.common.getEffectiveStatus(settings, entity.status),
      studnetName: studentInfo.name,
      loginId: studentInfo.loginId,
      studentId: studentInfo.studentId,
      reason: entity.reason,
      submittedAt: entity.createdAt,
      endAt: settings.endAt,
      reviewComment: entity.reviewComment,
      reviewerName,
      reviewedAt: entity.reviewedAt,
    };
  }
}
