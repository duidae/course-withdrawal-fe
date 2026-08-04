import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseWithdrawalDbName } from '../database/course-withdrawal-db/config/db.config';
import { CourseWithdrawalSetting } from '../database/course-withdrawal-db/entities/course-withdrawal-settings.entity';
import { DbError } from '../shared/errors';
import { CourseWithdrawalCommonService } from './course-withdrawal-common.service';
import { type CourseWithdrawalSettingsInfo } from './course-withdrawal.types';

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
}
