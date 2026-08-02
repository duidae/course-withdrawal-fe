import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { CourseWithdrawalModule } from './course-withdrawal.module';

describe('CourseWithdrawalController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CourseWithdrawalModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/withdrawal-list returns paginated withdrawals', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/withdrawal-list')
      .query({ page: 1, pageSize: 2 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      total: expect.any(Number),
      page: 1,
      pageSize: 2,
      data: expect.any(Array),
    });
    expect(response.body.data).toHaveLength(2);
  });

  it('/api/withdrawal/:id returns the requested student', async () => {
    const response = await request(app.getHttpServer()).get('/api/withdrawal/1');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 1,
      status: expect.any(String),
    });
  });

  it('/api/courses/:courseId returns course info', async () => {
    const response = await request(app.getHttpServer()).get('/api/courses/CS101');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      courseName: expect.any(String),
    });
  });
});
