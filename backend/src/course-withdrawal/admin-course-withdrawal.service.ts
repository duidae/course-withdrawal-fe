import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type LtiAuthUser } from '../auth/models/lti-auth-user.model';
import { CourseWithdrawalDbName } from '../database/course-withdrawal-db/config/db.config';
import { CourseWithdrawalSetting } from '../database/course-withdrawal-db/entities/course-withdrawal-settings.entity';
import { DbError, InvalidInputError } from '../shared/errors';
import { CourseWithdrawalCommonService } from './course-withdrawal-common.service';
import {
  type CourseWithdrawalSettingsDetail,
  type CourseWithdrawalSettingsInfo,
  type CreateCourseWithdrawalSettingsInput,
  type UpdateCourseWithdrawalSettingsInput,
} from './course-withdrawal.types';

@Injectable()
export class AdminCourseWithdrawalService {
  constructor(
    @InjectRepository(CourseWithdrawalSetting, CourseWithdrawalDbName)
    private readonly courseWithdrawalSettingRepository: Repository<CourseWithdrawalSetting>,
    private readonly common: CourseWithdrawalCommonService,
  ) {}

  async getCourseWithdrawalSettings(): Promise<CourseWithdrawalSettingsInfo[]> {
    let settingsList: CourseWithdrawalSetting[];

    try {
      settingsList = await this.courseWithdrawalSettingRepository.find();
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    return Promise.all(
      settingsList.map(async (settings) => {
        const [withdrawalCount, course] = await Promise.all([
          this.common.getWithdrawalCount(settings.courseId),
          this.common.getCourseTermAndName(settings.courseId),
        ]);

        return {
          term: course.term,
          courseName: course.courseName,
          courseId: settings.courseId,
          withdrawalCount,
          enabled: settings.enabled,
        };
      }),
    );
  }

  async createCourseWithdrawalSettings(
    courseId: number,
    input: CreateCourseWithdrawalSettingsInput,
    user: LtiAuthUser,
  ): Promise<CourseWithdrawalSettingsDetail> {
    const { startAt, endAt } = this.parseAndValidateDates(input.startAt, input.endAt);

    let existing: CourseWithdrawalSetting | null;
    try {
      existing = await this.courseWithdrawalSettingRepository.findOneBy({ courseId });
    } catch (error) {
      throw new DbError((error as Error).message);
    }

    if (existing) {
      throw new InvalidInputError(
        'course withdrawal settings already exist for this course',
      );
    }

    try {
      const entity = this.courseWithdrawalSettingRepository.create({
        courseId,
        startAt,
        endAt,
        noticeDelta: input.noticeDelta,
        enabled: input.enabled ?? true,
        createdBy: user.canvasUserId,
        updatedBy: user.canvasUserId,
      });

      const saved = await this.courseWithdrawalSettingRepository.save(entity);
      return this.toSettingsDetail(saved);
    } catch (error) {
      throw new DbError((error as Error).message);
    }
  }

  async updateCourseWithdrawalSettings(
    courseId: number,
    input: UpdateCourseWithdrawalSettingsInput,
    user: LtiAuthUser,
  ): Promise<CourseWithdrawalSettingsDetail> {
    const entity = await this.common.getWithdrawalSettings(courseId);

    const { startAt, endAt } = this.parseAndValidateDates(
      input.startAt ?? entity.startAt,
      input.endAt ?? entity.endAt,
    );

    try {
      entity.startAt = startAt;
      entity.endAt = endAt;
      if (input.noticeDelta !== undefined) {
        entity.noticeDelta = input.noticeDelta;
      }
      if (input.enabled !== undefined) {
        entity.enabled = input.enabled;
      }
      entity.updatedBy = user.canvasUserId;

      const saved = await this.courseWithdrawalSettingRepository.save(entity);
      return this.toSettingsDetail(saved);
    } catch (error) {
      throw new DbError((error as Error).message);
    }
  }

  private parseAndValidateDates(
    rawStartAt: string | Date,
    rawEndAt: string | Date,
  ): { startAt: Date; endAt: Date } {
    const startAt = new Date(rawStartAt);
    const endAt = new Date(rawEndAt);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      throw new InvalidInputError('startAt and endAt must be valid dates');
    }
    if (startAt >= endAt) {
      throw new InvalidInputError('startAt must be before endAt');
    }

    return { startAt, endAt };
  }

  private toSettingsDetail(
    entity: CourseWithdrawalSetting,
  ): CourseWithdrawalSettingsDetail {
    return {
      courseId: entity.courseId,
      startAt: entity.startAt,
      endAt: entity.endAt,
      noticeDelta: entity.noticeDelta,
      enabled: entity.enabled,
    };
  }
}
