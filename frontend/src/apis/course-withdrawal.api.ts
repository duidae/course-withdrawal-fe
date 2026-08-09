import { request } from "./request";
import { BaseWithdrawalStatus, type Withdrawal } from "../models";

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
  studentCanvasIds: string[];
  status:
    | typeof BaseWithdrawalStatus.APPROVED
    | typeof BaseWithdrawalStatus.DECLINED;
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
