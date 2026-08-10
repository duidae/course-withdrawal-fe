import { request } from "./request";
import {
  BaseWithdrawalStatus,
  type Withdrawal,
  type CourseWithdrawalSettingsInfo,
} from "../models";

// TODO: remove mock
import { INIT_STUDENTS, classOptions } from './mockup'

type CreateWithdrawalInput = {
  reason: string;
};

type ReviewWithdrawalInput = {
  status:
    | typeof BaseWithdrawalStatus.APPROVED
    | typeof BaseWithdrawalStatus.DECLINED;
  reviewComment?: string;
};

type BatchReviewWithdrawalInput = {
  withdrawalIds: number[];
  status:
    | typeof BaseWithdrawalStatus.APPROVED
    | typeof BaseWithdrawalStatus.DECLINED;
  reviewComment?: string;
};

type BatchReviewResult = {
  withdrawalId: number;
  success: boolean;
  withdrawal?: Withdrawal;
  error?: string;
};

type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

type GetWithdrawalsParams = {
  page?: number;
  pageSize?: number;
};

export type CourseSettings = {
  sectionOptions: string[],
  reviewDeadline: string;
};

export type {
  CreateWithdrawalInput,
  ReviewWithdrawalInput,
  BatchReviewWithdrawalInput,
  BatchReviewResult,
  PaginatedResult,
  GetWithdrawalsParams,
};

const defaultPageSize = 10;

export const getWithdrawal = async (courseId: number): Promise<Withdrawal> => {
  /*
  const response = await request.get<Withdrawal>(
    `/api/courses/${courseId}/withdrawal`,
  );
  return response.data;
  */
  let student = INIT_STUDENTS[0];
  if (courseId === 1) {
    student = {
      ...student,
      status: BaseWithdrawalStatus.NOTSUBMITTED,
      teachers: ['彭文孝','陳永昇','謝秉均'],
      startAt: '2026/05/01 08:00',
      reviewDeadline: '2026/05/13 08:00'
    }
  } else if (courseId === 2) {
    student = {
      ...student,
      status: BaseWithdrawalStatus.PENDING,
      teachers: ['彭文孝','陳永昇','謝秉均'],
      startAt: '2026/05/01 08:00',
      reviewDeadline: '2026/05/13 08:00'
    }
  } else if (courseId === 3) {
    student = {
      ...student,
      status: BaseWithdrawalStatus.OVERDUE,
      teachers: ['彭文孝','陳永昇','謝秉均'],
      startAt: '2026/05/01 08:00',
      reviewDeadline: '2026/05/13 08:00',
      reviewerName: '彭文孝',
      reviewedAt: '2026/05/13 08:00'
    }
  } else if (courseId === 4) {
    student = {
      ...student,
      status: BaseWithdrawalStatus.APPROVED,
      teachers: ['彭文孝','陳永昇','謝秉均'],
      startAt: '2026/05/01 08:00',
      reviewDeadline: '2026/05/13 08:00',
      reviewerName: '彭文孝',
      reviewedAt: '2026/05/13 08:00'
    }
  } else if (courseId === 5) {
    student = {
      ...student,
      status: BaseWithdrawalStatus.DECLINED,
      teachers: ['彭文孝','陳永昇','謝秉均'],
      startAt: '2026/05/01 08:00',
      reviewDeadline: '2026/05/13 08:00',
      reviewerName: '彭文孝',
      reviewedAt: '2026/05/13 08:00'
    }
  }
  return student;
};

export const createWithdrawal = async (
  courseId: number,
  input: CreateWithdrawalInput,
): Promise<Withdrawal> => {
  const response = await request.post<Withdrawal>(
    `/api/courses/${courseId}/withdrawal`,
    input,
  );
  return response.data;
};

export const getCourseSettings = async (courseId: number): Promise<CourseSettings> => {
  /*
  const response = await request.get<CourseSettings>(
      `/api/courses/${courseId}/courseSettings`,
    );
  return response.data;
  */
 console.log(courseId);
  return {
    sectionOptions: classOptions,
    reviewDeadline: '2026/08/08 23:59',
  };
};

export const getWithdrawals = async (
  courseId: number,
  params: GetWithdrawalsParams = {},
): Promise<PaginatedResult<Withdrawal>> => {
  /*
  const { page = 1, pageSize = defaultPageSize } = params;
  const response = await request.get<PaginatedResult<Withdrawal>>(
    `/api/courses/${courseId}/withdrawals`,
    { params: { page, pageSize } },
  );
  return response.data;
  */
  console.log(courseId, params, defaultPageSize);
  return {
    data: INIT_STUDENTS,
    total: 1,
    page: 1,
    pageSize: 10,
  };
};

export const reviewWithdrawal = async (
  courseId: number,
  withdrawalId: number,
  input: ReviewWithdrawalInput,
): Promise<Withdrawal> => {
  const response = await request.patch<Withdrawal>(
    `/api/courses/${courseId}/withdrawals/${withdrawalId}`,
    input,
  );
  return response.data;
};

export const batchReviewWithdrawals = async (
  courseId: number,
  input: BatchReviewWithdrawalInput,
): Promise<BatchReviewResult[]> => {
  const response = await request.patch<BatchReviewResult[]>(
    `/api/courses/${courseId}/withdrawals/batch-review`,
    input,
  );
  return response.data;
};

export const getAllCourseSettings = async (): Promise<
  CourseWithdrawalSettingsInfo[]
> => {
  const response =
    await request.get<CourseWithdrawalSettingsInfo[]>(`/api/admin/courses`);
  return response.data;
};

export const createCourseSettings = async (
  courseId: number,
): Promise<CourseWithdrawalSettingsInfo> => {
  const response = await request.post<CourseWithdrawalSettingsInfo>(
    `/api/admin/courses/${courseId}`,
  );
  return response.data;
};

export const updateCourseSettings = async (
  courseId: number,
): Promise<CourseWithdrawalSettingsInfo> => {
  const response = await request.patch<CourseWithdrawalSettingsInfo>(
    `/api/admin/courses/${courseId}`,
  );
  return response.data;
};
