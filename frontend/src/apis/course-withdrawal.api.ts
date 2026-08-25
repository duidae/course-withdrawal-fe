import { request } from "./request";
import {
  BaseWithdrawalStatus,
  type WithdrawalDto,
  type CourseWithdrawalSettingsInfoDto,
  type CourseWithdrawalSettingsDetailDto,
} from "../models";
import { defaultPageSize } from "../pages/constants";

type CreateWithdrawalInput = {
  sectionId: number;
  reason: string;
};

type ReviewWithdrawalInput = {
  status:
    | typeof BaseWithdrawalStatus.APPROVED
    | typeof BaseWithdrawalStatus.DECLINED;
  reviewComment?: string;
};

type BatchReviewWithdrawalInput = {
  withdrawalIds: string[];
  status:
    | typeof BaseWithdrawalStatus.APPROVED
    | typeof BaseWithdrawalStatus.DECLINED;
  reviewComment?: string;
};

type PaginatedResult<T> = {
  data: T[] | null; // null represents not enabled
  total: number;
  page: number;
  pageSize: number;
};

type GetWithdrawalsParams = {
  page?: number;
  pageSize?: number;
};

type CreateCourseWithdrawalSettingsInput = {
  sectionId: number;
  startAt: string;
  endAt: string;
  reviewDeadline?: string;
  noticeDelta?: object;
  enabled?: boolean;
};

type UpdateCourseWithdrawalSettingsInput =
  Partial<CreateCourseWithdrawalSettingsInput>;

type BatchUpdateCourseWithdrawalSettingsInput = {
  sectionIds: number[];
} & Partial<Omit<CreateCourseWithdrawalSettingsInput, "sectionId">>;

type CreateSectionWithdrawalSettingsInput = Omit<
  CreateCourseWithdrawalSettingsInput,
  "sectionId"
>;

type UpdateSectionWithdrawalSettingsInput = Omit<
  UpdateCourseWithdrawalSettingsInput,
  "sectionId"
>;

export type SectionOption = {
  label: string;
  id: string;
};

export type CourseSettingsDto = {
  isEnabled: boolean;
  sectionOptions: SectionOption[];
  reviewDeadline: string;
};

export type {
  CreateWithdrawalInput,
  ReviewWithdrawalInput,
  BatchReviewWithdrawalInput,
  PaginatedResult,
  GetWithdrawalsParams,
  CreateCourseWithdrawalSettingsInput,
  UpdateCourseWithdrawalSettingsInput,
  BatchUpdateCourseWithdrawalSettingsInput,
  CreateSectionWithdrawalSettingsInput,
  UpdateSectionWithdrawalSettingsInput,
};

export const getWithdrawal = async (
  courseId: number,
): Promise<WithdrawalDto> => {
  const response = await request.get<WithdrawalDto>(
    `/api/courses/${courseId}/withdrawal`,
  );
  return response.data;
};

export const createWithdrawal = async (
  courseId: number,
  input: CreateWithdrawalInput,
): Promise<WithdrawalDto> => {
  const response = await request.post<WithdrawalDto>(
    `/api/courses/${courseId}/withdrawal`,
    input,
  );
  return response.data;
};

export const getWithdrawals = async (
  courseId: number,
  params: GetWithdrawalsParams = {},
): Promise<PaginatedResult<WithdrawalDto>> => {
  const { page = 1, pageSize = defaultPageSize } = params;
  const response = await request.get<PaginatedResult<WithdrawalDto>>(
    `/api/courses/${courseId}/withdrawals`,
    { params: { page, pageSize } },
  );
  return response.data;
};

export const reviewWithdrawal = async (
  courseId: number,
  withdrawalId: string,
  input: ReviewWithdrawalInput,
): Promise<void> => {
  await request.patch(
    `/api/courses/${courseId}/withdrawals/${withdrawalId}`,
    input,
  );
};

export const batchReviewWithdrawals = async (
  courseId: number,
  input: BatchReviewWithdrawalInput,
): Promise<void> => {
  await request.patch(`/api/courses/${courseId}/withdrawals/batch`, input);
};

export const getCourseSettings = async (
  courseId: number,
): Promise<CourseWithdrawalSettingsInfoDto[]> => {
  const response = await request.get<CourseWithdrawalSettingsInfoDto[]>(
    `/api/admin/courses/${courseId}/withdrawal-settings`,
  );
  return response.data;
};

export const createCourseSettings = async (
  courseId: number,
  input: CreateCourseWithdrawalSettingsInput,
): Promise<void> => {
  await request.post(
    `/api/admin/courses/${courseId}/withdrawal-settings`,
    input,
  );
};

export const updateCourseSettings = async (
  courseId: number,
  input: UpdateCourseWithdrawalSettingsInput,
): Promise<void> => {
  await request.patch(
    `/api/admin/courses/${courseId}/withdrawal-settings`,
    input,
  );
};

export const batchUpdateCourseSettings = async (
  courseId: number,
  input: BatchUpdateCourseWithdrawalSettingsInput,
): Promise<void> => {
  await request.patch(
    `/api/admin/courses/${courseId}/withdrawal-settings/batch`,
    input,
  );
};

export const getSectionSettings = async (
  courseId: number,
  sectionId: number,
): Promise<CourseWithdrawalSettingsDetailDto> => {
  const response = await request.get<CourseWithdrawalSettingsDetailDto>(
    `/api/admin/courses/${courseId}/sections/${sectionId}/withdrawal-settings`,
  );
  return response.data;
};

export const createSectionSettings = async (
  courseId: number,
  sectionId: number,
  input: CreateSectionWithdrawalSettingsInput,
): Promise<void> => {
  await request.post(
    `/api/admin/courses/${courseId}/sections/${sectionId}/withdrawal-settings`,
    input,
  );
};

export const updateSectionSettings = async (
  courseId: number,
  sectionId: number,
  input: UpdateSectionWithdrawalSettingsInput,
): Promise<void> => {
  await request.patch(
    `/api/admin/courses/${courseId}/sections/${sectionId}/withdrawal-settings`,
    input,
  );
};
