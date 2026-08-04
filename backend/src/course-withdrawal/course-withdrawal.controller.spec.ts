import { Test, TestingModule } from '@nestjs/testing';
import { type ExecutionContext, type INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CanvasApiService } from '@ntucool/nestjs-canvas-api';
import { CanvasLmsAuthGuard } from '@ntucool/nestjs-canvas-lms-auth/dist/canvas-lms-auth.guard';
import request from 'supertest';

import { type LtiAuthUser } from '../auth/models/lti-auth-user.model';
import { CourseWithdrawalDbName } from '../database/course-withdrawal-db/config/db.config';
import { CourseWithdrawal } from '../database/course-withdrawal-db/entities/course-withdrawal.entity';
import { CourseWithdrawalSetting } from '../database/course-withdrawal-db/entities/course-withdrawal-settings.entity';
import { CourseWithdrawalStatus } from '../database/course-withdrawal-db/entities/course-withdrawal-status.enum';
import { ResponseErrorFilter } from '../shared/errors';
import {
  repositoryMockFactory,
  type MockRepository,
} from '../test-utils/mock/repository.mock';
import { AdminCourseWithdrawalService } from './admin-course-withdrawal.service';
import { CourseWithdrawalCommonService } from './course-withdrawal-common.service';
import { CourseWithdrawalController } from './course-withdrawal.controller';
import {
  WithdrawalStatus,
  type BatchReviewResult,
  type CourseWithdrawalSettingsInfo,
  type PaginatedResult,
  type Withdrawal,
} from './course-withdrawal.types';
import { StudentCourseWithdrawalService } from './student-course-withdrawal.service';
import { TeacherCourseWithdrawalService } from './teacher-course-withdrawal.service';

describe('CourseWithdrawalController', () => {
  let app: INestApplication;
  let repository: MockRepository<CourseWithdrawal>;
  let settingsRepository: MockRepository<CourseWithdrawalSetting>;
  let commonService: CourseWithdrawalCommonService;
  const canvasApiService = {
    courses: { get: jest.fn() },
    users: {
      get: jest.fn(),
      list: jest.fn().mockResolvedValue([{ name: 'Teacher A' }, { name: 'Teacher B' }]),
    },
    enrollments: {
      list: jest.fn().mockResolvedValue([{ courseSectionId: 1 }]),
    },
    sections: {
      get: jest.fn().mockResolvedValue({ name: 'Mock Section' }),
    },
  };

  const withdrawal: CourseWithdrawal = {
    id: '11111111-1111-1111-1111-111111111111',
    studentId: 'B11000000',
    courseId: 'CS101',
    status: CourseWithdrawalStatus.Pending,
    reason: '故申請停修。',
    createdAt: new Date('2026-05-11T08:00:00Z'),
    updatedAt: new Date('2026-05-11T08:00:00Z'),
  };

  const ltiUser: LtiAuthUser = {
    canvasUserId: 1,
    roles: [],
    courseName: 'LTI Course Name',
  };

  const settings: CourseWithdrawalSetting = {
    id: '22222222-2222-2222-2222-222222222222',
    courseId: 'CS101',
    startAt: new Date('2026-01-01T00:00:00Z'),
    endAt: new Date('2099-01-01T00:00:00Z'),
    enabled: true,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CourseWithdrawalController],
      providers: [
        CourseWithdrawalCommonService,
        StudentCourseWithdrawalService,
        TeacherCourseWithdrawalService,
        AdminCourseWithdrawalService,
        {
          provide: getRepositoryToken(CourseWithdrawal, CourseWithdrawalDbName),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(CourseWithdrawalSetting, CourseWithdrawalDbName),
          useFactory: repositoryMockFactory,
        },
        {
          provide: CanvasApiService,
          useValue: canvasApiService,
        },
      ],
    })
      .overrideGuard(CanvasLmsAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest<{ user?: LtiAuthUser }>();
          request.user = ltiUser;
          return true;
        },
      })
      .compile();

    repository = moduleFixture.get<MockRepository<CourseWithdrawal>>(
      getRepositoryToken(CourseWithdrawal, CourseWithdrawalDbName),
    );
    settingsRepository = moduleFixture.get<MockRepository<CourseWithdrawalSetting>>(
      getRepositoryToken(CourseWithdrawalSetting, CourseWithdrawalDbName),
    );
    commonService = moduleFixture.get(CourseWithdrawalCommonService);

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new ResponseErrorFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const httpServer = () => app.getHttpServer() as Parameters<typeof request>[0];

  it('/api/courses/:courseId/withdrawal-list returns paginated withdrawals', async () => {
    settingsRepository.findOneBy!.mockResolvedValue(settings);
    repository.findAndCount!.mockResolvedValue([[withdrawal], 1]);

    const response = await request(httpServer())
      .get(`/api/courses/${withdrawal.courseId}/withdrawal-list`)
      .query({ page: 1, pageSize: 2 });

    const body = response.body as PaginatedResult<Withdrawal>;

    expect(response.status).toBe(200);
    expect(repository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: { courseId: withdrawal.courseId } }),
    );
    expect(body).toMatchObject({ total: 1, page: 1, pageSize: 2 });
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({
      status: withdrawal.status,
      reason: withdrawal.reason,
      studnetName: 'Mock Student name B11000000',
      sectionName: 'Mock Section name B11000000',
      studentId: withdrawal.studentId,
      endAt: settings.endAt.toISOString(),
    });
  });

  it('/api/courses/:courseId/students/:studentId/withdrawal returns the requested withdrawal', async () => {
    settingsRepository.findOneBy!.mockResolvedValue(settings);
    repository.findOneBy!.mockResolvedValue(withdrawal);

    const response = await request(httpServer()).get(
      `/api/courses/${withdrawal.courseId}/students/${withdrawal.studentId}/withdrawal`,
    );

    const body = response.body as Withdrawal;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: CourseWithdrawalStatus.Pending,
      reason: withdrawal.reason,
      courseName: ltiUser.courseName,
      sectionName: `Mock Section name ${withdrawal.courseId} ${ltiUser.courseName}`,
      teachers: ['Mock Teacher 1', 'Mock Teacher 2'],
    });
  });

  it('/api/courses/:courseId/students/:studentId/withdrawal resolves the reviewer name via the Canvas API', async () => {
    settingsRepository.findOneBy!.mockResolvedValue(settings);
    repository.findOneBy!.mockResolvedValue({
      ...withdrawal,
      status: CourseWithdrawalStatus.Approved,
      reviewerId: 'T00000001',
    });
    canvasApiService.users.get.mockResolvedValue({ name: '林教授' });

    const response = await request(httpServer()).get(
      `/api/courses/${withdrawal.courseId}/students/${withdrawal.studentId}/withdrawal`,
    );

    const body = response.body as Withdrawal;

    expect(response.status).toBe(200);
    expect(canvasApiService.users.get).toHaveBeenCalledWith('T00000001');
    expect(body.reviewerName).toBe('林教授');
  });

  it('/api/courses/:courseId/students/:studentId/withdrawal returns a notSubmitted status when no withdrawal exists', async () => {
    settingsRepository.findOneBy!.mockResolvedValue(settings);
    repository.findOneBy!.mockResolvedValue(null);

    const response = await request(httpServer()).get(
      `/api/courses/${withdrawal.courseId}/students/unknown-student/withdrawal`,
    );

    const body = response.body as Withdrawal;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: WithdrawalStatus.NotSubmitted,
      courseName: ltiUser.courseName,
    });
  });

  it('/api/courses/:courseId/students/:studentId/withdrawal returns overdue for a pending withdrawal past the deadline', async () => {
    settingsRepository.findOneBy!.mockResolvedValue({
      ...settings,
      endAt: new Date('2000-01-01T00:00:00Z'),
    });
    repository.findOneBy!.mockResolvedValue(withdrawal);

    const response = await request(httpServer()).get(
      `/api/courses/${withdrawal.courseId}/students/${withdrawal.studentId}/withdrawal`,
    );

    const body = response.body as Withdrawal;

    expect(response.status).toBe(200);
    expect(body.status).toBe(WithdrawalStatus.Overdue);
  });

  it('/api/courses/:courseId/students/:studentId/withdrawal returns 404 when course withdrawal settings do not exist', async () => {
    settingsRepository.findOneBy!.mockResolvedValue(null);

    const response = await request(httpServer()).get(
      `/api/courses/CS999/students/${withdrawal.studentId}/withdrawal`,
    );

    expect(response.status).toBe(404);
  });

  it('POST /api/courses/:courseId/students/:studentId/withdrawal creates a withdrawal', async () => {
    repository.create!.mockImplementation((input: object) => input);
    repository.save!.mockImplementation((input: object) =>
      Promise.resolve({ ...withdrawal, ...input }),
    );

    const response = await request(httpServer())
      .post(
        `/api/courses/${withdrawal.courseId}/students/${withdrawal.studentId}/withdrawal`,
      )
      .send({ reason: withdrawal.reason });

    const body = response.body as Withdrawal;

    expect(response.status).toBe(201);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId: withdrawal.courseId,
        studentId: withdrawal.studentId,
        reason: withdrawal.reason,
        status: CourseWithdrawalStatus.Pending,
      }),
    );
    expect(body).toMatchObject({
      reason: withdrawal.reason,
      status: CourseWithdrawalStatus.Pending,
      courseName: ltiUser.courseName,
    });
  });

  it('POST /api/courses/:courseId/students/:studentId/withdrawal rejects a blank reason', async () => {
    const response = await request(httpServer())
      .post(
        `/api/courses/${withdrawal.courseId}/students/${withdrawal.studentId}/withdrawal`,
      )
      .send({ reason: '   ' });

    expect(response.status).toBe(400);
  });

  it('PATCH /api/courses/:courseId/students/:studentId/withdrawal approves a withdrawal', async () => {
    repository.findOneBy!.mockResolvedValue({ ...withdrawal });
    repository.save!.mockImplementation((input: object) => Promise.resolve(input));

    const response = await request(httpServer())
      .patch(
        `/api/courses/${withdrawal.courseId}/students/${withdrawal.studentId}/withdrawal`,
      )
      .send({ status: CourseWithdrawalStatus.Approved, reviewComment: 'looks good' });

    const body = response.body as Withdrawal;

    expect(response.status).toBe(200);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: CourseWithdrawalStatus.Approved,
        reviewerId: String(ltiUser.canvasUserId),
        reviewComment: 'looks good',
      }),
    );
    const calls = repository.save!.mock.calls as [CourseWithdrawal][];
    const [savedEntity] = calls[calls.length - 1];
    expect(savedEntity.reviewedAt).toBeInstanceOf(Date);
    expect(body).toMatchObject({
      status: CourseWithdrawalStatus.Approved,
      reviewComment: 'looks good',
      courseName: ltiUser.courseName,
    });
  });

  it('PATCH /api/courses/:courseId/students/:studentId/withdrawal declines a withdrawal', async () => {
    repository.findOneBy!.mockResolvedValue({ ...withdrawal });
    repository.save!.mockImplementation((input: object) => Promise.resolve(input));

    const response = await request(httpServer())
      .patch(
        `/api/courses/${withdrawal.courseId}/students/${withdrawal.studentId}/withdrawal`,
      )
      .send({ status: CourseWithdrawalStatus.Declined });

    const body = response.body as Withdrawal;

    expect(response.status).toBe(200);
    expect(body.status).toBe(CourseWithdrawalStatus.Declined);
  });

  it('PATCH /api/courses/:courseId/students/:studentId/withdrawal rejects an invalid status', async () => {
    const response = await request(httpServer())
      .patch(
        `/api/courses/${withdrawal.courseId}/students/${withdrawal.studentId}/withdrawal`,
      )
      .send({ status: CourseWithdrawalStatus.Pending });

    expect(response.status).toBe(400);
  });

  it('PATCH /api/courses/:courseId/students/:studentId/withdrawal returns 404 when the withdrawal does not exist', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    const response = await request(httpServer())
      .patch(`/api/courses/${withdrawal.courseId}/students/unknown-student/withdrawal`)
      .send({ status: CourseWithdrawalStatus.Approved });

    expect(response.status).toBe(404);
  });

  it('PATCH /api/courses/:courseId/withdrawals/batch-review approves multiple withdrawals with partial success', async () => {
    repository.findOneBy!.mockImplementation((where: { studentId: string }) =>
      Promise.resolve(
        where.studentId === 'missing-student'
          ? null
          : { ...withdrawal, studentId: where.studentId },
      ),
    );
    repository.save!.mockImplementation((input: object) => Promise.resolve(input));

    const response = await request(httpServer())
      .patch(`/api/courses/${withdrawal.courseId}/withdrawals/batch-review`)
      .send({
        studentIds: [withdrawal.studentId, 'missing-student'],
        status: CourseWithdrawalStatus.Approved,
        reviewComment: 'batch approved',
      });

    const body = response.body as BatchReviewResult[];

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].studentId).toBe(withdrawal.studentId);
    expect(body[0].success).toBe(true);
    expect(body[0].withdrawal?.status).toBe(CourseWithdrawalStatus.Approved);
    expect(body[0].withdrawal?.reviewComment).toBe('batch approved');
    expect(body[1].studentId).toBe('missing-student');
    expect(body[1].success).toBe(false);
    expect(typeof body[1].error).toBe('string');
  });

  it('PATCH /api/courses/:courseId/withdrawals/batch-review rejects an empty studentIds array', async () => {
    const response = await request(httpServer())
      .patch(`/api/courses/${withdrawal.courseId}/withdrawals/batch-review`)
      .send({ studentIds: [], status: CourseWithdrawalStatus.Approved });

    expect(response.status).toBe(400);
  });

  it('/api/admin-list returns withdrawal settings and counts for every configured course', async () => {
    settingsRepository.find!.mockResolvedValue([settings]);
    repository.count!.mockResolvedValue(3);
    canvasApiService.courses.get.mockResolvedValue({
      name: '深度學習 Deep Learning',
      term: { name: '114-2' },
    });

    const response = await request(httpServer()).get('/api/admin-list');

    const body = response.body as CourseWithdrawalSettingsInfo[];

    expect(response.status).toBe(200);
    expect(repository.count).toHaveBeenCalledWith({
      where: { courseId: settings.courseId },
    });
    expect(canvasApiService.courses.get).toHaveBeenCalledWith(
      settings.courseId,
      expect.objectContaining({ parameters: { include: ['term'] } }),
    );
    expect(body).toEqual([
      {
        term: '114-2',
        courseName: '深度學習 Deep Learning',
        courseId: settings.courseId,
        withdrawalCount: 3,
        enabled: settings.enabled,
      },
    ]);
  });

  it('/api/admin-list wraps Canvas API failures as a CanvasApiError', async () => {
    settingsRepository.find!.mockResolvedValue([settings]);
    repository.count!.mockResolvedValue(3);
    canvasApiService.courses.get.mockRejectedValue(new Error('unauthorized'));

    const response = await request(httpServer()).get('/api/admin-list');

    expect(response.status).toBe(400);
  });

  it('/api/admin-list returns an empty array when no courses are configured', async () => {
    settingsRepository.find!.mockResolvedValue([]);

    const response = await request(httpServer()).get('/api/admin-list');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('getCourseInfo returns mock section and teacher names', async () => {
    const courseInfo = await commonService.getCourseInfo('CS101', ltiUser);

    expect(courseInfo).toEqual({
      sectionName: `Mock Section name CS101 ${ltiUser.courseName}`,
      teachers: ['Mock Teacher 1', 'Mock Teacher 2'],
    });
  });

  it('getStudentInfo returns mock student info', async () => {
    const studentInfo = await commonService.getStudentInfo('B11000000');

    expect(studentInfo).toEqual({
      name: 'Mock Student name B11000000',
      loginId: 'Mock Student loginId B11000000',
      studentId: 'Mock Student studentId B11000000',
      sectionName: 'Mock Section name B11000000',
    });
  });

  it('getReviewerName returns the reviewer name from the Canvas API', async () => {
    canvasApiService.users.get.mockResolvedValue({ name: '林教授' });

    const reviewerName = await commonService.getReviewerName('T00000001');

    expect(canvasApiService.users.get).toHaveBeenCalledWith('T00000001');
    expect(reviewerName).toBe('林教授');
  });

  it('getReviewerName returns undefined when the Canvas API call fails', async () => {
    canvasApiService.users.get.mockRejectedValue(new Error('not found'));

    const reviewerName = await commonService.getReviewerName('unknown');

    expect(reviewerName).toBeUndefined();
  });
});
