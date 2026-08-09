import { request } from "./request";

// Mirrors backend/src/course-withdrawal/course-withdrawal.types.ts.
// Dates arrive over HTTP as ISO strings, not Date instances.

const WithdrawalStatus = {
  Pending: "pending",
  Approved: "approved",
  Declined: "declined",
  NotSubmitted: "notSubmitted",
  NotStarted: "notStarted",
  NotEnabled: "notEnabled",
  Overdue: "overdue",
} as const;

type WithdrawalStatus =
  (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus];

type Withdrawal = {
  status: WithdrawalStatus;
  courseName?: string;
  sectionName?: string;
  teachers?: string[];
  studnetName?: string;
  loginId?: string;
  studentId?: string;
  reason?: string;
  submittedAt?: string;
  endAt?: string;
  reviewComment?: string;
  reviewerName?: string;
  reviewedAt?: string;
  notice?: object;
};

type CreateWithdrawalInput = {
  reason: string;
};

type ReviewWithdrawalInput = {
  status: typeof WithdrawalStatus.Approved | typeof WithdrawalStatus.Declined;
  reviewComment?: string;
};

type BatchReviewWithdrawalInput = {
  studentCanvasIds: string[];
  status: typeof WithdrawalStatus.Approved | typeof WithdrawalStatus.Declined;
  reviewComment?: string;
};

type BatchReviewResult = {
  studentCanvasId: string;
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

export type {
  Withdrawal,
  CreateWithdrawalInput,
  ReviewWithdrawalInput,
  BatchReviewWithdrawalInput,
  BatchReviewResult,
  PaginatedResult,
  GetWithdrawalsParams,
};

const defaultPageSize = 10;

export const getWithdrawal = async (courseId: number): Promise<Withdrawal> => {
  const response = await request.get<Withdrawal>(
    `/api/courses/${courseId}/withdrawal`,
  );
  return response.data;
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

export const getWithdrawals = async (
  courseId: number,
  params: GetWithdrawalsParams = {},
): Promise<PaginatedResult<Withdrawal>> => {
  const { page = 1, pageSize = defaultPageSize } = params;
  const response = await request.get<PaginatedResult<Withdrawal>>(
    `/api/courses/${courseId}/withdrawals`,
    { params: { page, pageSize } },
  );
  return response.data;
};

export const reviewWithdrawal = async (
  courseId: number,
  studentCanvasId: string,
  input: ReviewWithdrawalInput,
): Promise<Withdrawal> => {
  const response = await request.patch<Withdrawal>(
    `/api/courses/${courseId}/students/${studentCanvasId}/withdrawal`,
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
