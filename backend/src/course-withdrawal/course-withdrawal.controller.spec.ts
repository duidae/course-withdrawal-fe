import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';

import { CourseWithdrawalDbName } from '../database/course-withdrawal-db/config/db.config';
import { CourseWithdrawal } from '../database/course-withdrawal-db/entities/course-withdrawal.entity';
import { ResponseErrorFilter } from '../shared/errors';
import {
  repositoryMockFactory,
  type MockRepository,
} from '../test-utils/mock/repository.mock';
import { CourseWithdrawalController } from './course-withdrawal.controller';
import {
  CourseWithdrawalService,
  type PaginatedResult,
  type Withdrawal,
} from './course-withdrawal.service';

describe('CourseWithdrawalController', () => {
  let app: INestApplication;
  let repository: MockRepository<CourseWithdrawal>;

  const withdrawal: CourseWithdrawal = {
    id: '11111111-1111-1111-1111-111111111111',
    studentId: 'B11000000',
    courseId: 'CS101',
    courseName: '大型語言模型與資訊安全系統',
    studentName: '丁O寧',
    reason: '故申請停修。',
    status: 'pending',
    applyTime: new Date('2026-05-11T08:00:00Z'),
    deadline: new Date('2026-05-11T08:00:00Z'),
    createdDate: new Date('2026-05-11T08:00:00Z'),
    updatedDate: new Date('2026-05-11T08:00:00Z'),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CourseWithdrawalController],
      providers: [
        CourseWithdrawalService,
        {
          provide: getRepositoryToken(CourseWithdrawal, CourseWithdrawalDbName),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    repository = moduleFixture.get<MockRepository<CourseWithdrawal>>(
      getRepositoryToken(CourseWithdrawal, CourseWithdrawalDbName),
    );

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new ResponseErrorFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const httpServer = () => app.getHttpServer() as Parameters<typeof request>[0];

  it('/api/courses/:courseId/withdrawal-list returns paginated withdrawals', async () => {
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
      id: withdrawal.id,
      status: withdrawal.status,
    });
  });

  it('/api/courses/:courseId/students/:studentId/withdrawal returns the requested withdrawal', async () => {
    repository.findOneBy!.mockResolvedValue(withdrawal);

    const response = await request(httpServer()).get(
      `/api/courses/${withdrawal.courseId}/students/${withdrawal.studentId}/withdrawal`,
    );

    const body = response.body as Withdrawal;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: withdrawal.id,
      status: withdrawal.status,
    });
  });

  it('/api/courses/:courseId/students/:studentId/withdrawal returns 404 when not found', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    const response = await request(httpServer()).get(
      '/api/courses/CS999/students/unknown/withdrawal',
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
        status: 'pending',
      }),
    );
    expect(body).toMatchObject({
      courseId: withdrawal.courseId,
      studentId: withdrawal.studentId,
      reason: withdrawal.reason,
      status: 'pending',
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
});
