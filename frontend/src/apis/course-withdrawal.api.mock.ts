import { request } from "./request";
import {
  BaseWithdrawalStatus,
  type WithdrawalDto,
  type CourseWithdrawalSettingsInfoDto,
  type CourseWithdrawalSettingsDetailDto,
} from "../models";
import { defaultPageSize } from "../pages/constants";

// TODO: remove mock
import { INIT_STUDENTS, INIT_COURSES, BASE_SECS } from "./mockup";

type CreateWithdrawalInput = {
  reason: string;
  sectionId: number;
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
  data: T[];
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
  /*
  const response = await request.get<WithdrawalDto>(
    `/api/courses/${courseId}/withdrawal`,
  );
  return response.data;
  */
  await new Promise((resolve) => setTimeout(resolve, 1000));
  //throw Error('test');
  let student = INIT_STUDENTS[0];
  if (courseId === 1) {
    student = {
      ...student,
      courseName: "test",
      status: BaseWithdrawalStatus.NOTSUBMITTED,
      //teachers: ["彭文孝", "陳永昇", "謝秉均"],
      startAt: "2026/05/01 08:00",
      reviewDeadline: "2026/05/13 08:00",
      reviewerName: "彭文孝",
      reviewedAt: "2026/05/13 08:00",
    };
  } else if (courseId === 2) {
    student = {
      ...student,
      courseName: "test",
      status: BaseWithdrawalStatus.PENDING,
      teachers: ["彭文孝", "陳永昇", "謝秉均"],
      startAt: "2026/05/01 08:00",
      reviewDeadline: "2026/05/13 08:00",
    };
  } else if (courseId === 3) {
    student = {
      ...student,
      courseName: "test",
      status: BaseWithdrawalStatus.OVERDUE,
      teachers: ["彭文孝", "陳永昇", "謝秉均"],
      startAt: "2026/05/01 08:00",
      reviewDeadline: "2026/05/13 08:00",
      reviewerName: "彭文孝",
      reviewedAt: "2026/05/13 08:00",
    };
  } else if (courseId === 4) {
    student = {
      ...student,
      courseName: "test",
      status: BaseWithdrawalStatus.APPROVED,
      teachers: ["彭文孝", "陳永昇", "謝秉均"],
      startAt: "2026/05/01 08:00",
      reviewDeadline: "2026/05/13 08:00",
      reviewerName: "彭文孝",
      reviewedAt: "2026/05/13 08:00",
    };
  } else if (courseId === 5) {
    student = {
      ...student,
      courseName: "test",
      status: BaseWithdrawalStatus.DECLINED,
      teachers: ["彭文孝", "陳永昇", "謝秉均"],
      startAt: "2026/05/01 08:00",
      reviewDeadline: "2026/05/13 08:00",
      reviewerName: "彭文孝",
      reviewedAt: "2026/05/13 08:00",
    };
  }
  return student;
};

export const createWithdrawal = async (
  courseId: number,
  input: CreateWithdrawalInput,
): Promise<WithdrawalDto> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(courseId, input);
  //throw Error("test");
  return {
    ...INIT_STUDENTS[0],
    courseName: "test",
    status: BaseWithdrawalStatus.PENDING,
    teachers: ["彭文孝", "陳永昇", "謝秉均"],
    startAt: "2026/05/01 08:00",
    reviewDeadline: "2026/05/13 08:00",
  };
  /*
  const response = await request.post<WithdrawalDto>(
    `/api/courses/${courseId}/withdrawal`,
    input,
  );
  return response.data;
  */
};

export const getWithdrawals = async (
  courseId: number,
  params: GetWithdrawalsParams = {},
): Promise<PaginatedResult<WithdrawalDto>> => {
  /*
  const { page = 1, pageSize = defaultPageSize } = params;
  const response = await request.get<PaginatedResult<WithdrawalDto>>(
    `/api/courses/${courseId}/withdrawals`,
    { params: { page, pageSize } },
  );
  return response.data;
  */
  await new Promise((resolve) => setTimeout(resolve, 1000));
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
  withdrawalId: string,
  input: ReviewWithdrawalInput,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  throw Error("test");
  await request.patch(
    `/api/courses/${courseId}/withdrawals/${withdrawalId}`,
    input,
  );
};

export const batchReviewWithdrawals = async (
  courseId: number,
  input: BatchReviewWithdrawalInput,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  throw Error("test");
  await request.patch(
    `/api/courses/${courseId}/withdrawals/batch-review`,
    input,
  );
};

// Seeded from every course x its always-on sections, mirroring how the real
// course_withdrawal_section_settings table has one row per (courseId, sectionId).
let mockSectionSettings: CourseWithdrawalSettingsDetailDto[] =
  INIT_COURSES.flatMap((course) =>
    BASE_SECS.filter((section) => section.alwaysOn).map((section) => ({
      courseId: Number(course.courseId),
      sectionId: Number(section.id),
      startAt: "2026/07/01 00:00",
      endAt: "2026/07/25 23:59",
      reviewDeadline: "2026/08/08 23:59",
      noticeDelta: null,
      enabled: true,
      updatedBy: "系統管理員",
      updatedAt: "2026/06/20 10:00",
    })),
  );

export type SectionCatalogEntry = {
  id: number;
  name: string;
};

export const getSectionCatalog = (): SectionCatalogEntry[] =>
  BASE_SECS.map((s) => ({ id: Number(s.id), name: s.name }));

export const getSectionName = (sectionId: number): string | undefined =>
  getSectionCatalog().find((s) => s.id === sectionId)?.name;

export type CourseCatalogEntry = {
  courseId: number;
  semester: string;
  courseName: string;
};

export const findCourseById = (
  courseId: number,
): CourseCatalogEntry | undefined => {
  const course = INIT_COURSES.find((c) => Number(c.courseId) === courseId);
  if (!course) return undefined;

  return {
    courseId,
    semester: course.semester,
    courseName: course.courseName,
  };
};

const toSettingsInfo = (
  settings: CourseWithdrawalSettingsDetailDto,
): CourseWithdrawalSettingsInfoDto => {
  const course = INIT_COURSES.find(
    (c) => Number(c.courseId) === settings.courseId,
  );
  const section = BASE_SECS.find((s) => Number(s.id) === settings.sectionId);

  return {
    term: course?.semester.split(" ")[0] ?? "",
    courseName: course?.courseName ?? "",
    courseId: settings.courseId,
    sectionId: settings.sectionId,
    withdrawalCount: INIT_STUDENTS.filter(
      (s) => s.sectionName === section?.name,
    ).length,
    enabled: settings.enabled ?? false,
    startAt: settings.startAt,
    endAt: settings.endAt,
    reviewDeadline: settings.reviewDeadline ?? null,
    updatedBy: settings.updatedBy,
    updatedAt: settings.updatedAt,
  };
};

export const getCourseSettings = async (
  courseId: number,
): Promise<CourseWithdrawalSettingsInfoDto[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // courseId is required by the real route but ignored server-side: this
  // always returns every course's settings, not just courseId's.
  console.log(courseId);
  return mockSectionSettings.map(toSettingsInfo);
};

export const createCourseSettings = async (
  courseId: number,
  input: CreateCourseWithdrawalSettingsInput,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const existing = mockSectionSettings.find(
    (s) => s.courseId === courseId && s.sectionId === input.sectionId,
  );
  if (existing) {
    throw new Error(
      "course withdrawal settings already exist for this course section",
    );
  }

  mockSectionSettings = [
    ...mockSectionSettings,
    {
      courseId,
      sectionId: input.sectionId,
      startAt: input.startAt,
      endAt: input.endAt,
      reviewDeadline: input.reviewDeadline ?? null,
      noticeDelta: input.noticeDelta ?? null,
      enabled: input.enabled ?? true,
      updatedBy: "Admin",
      updatedAt: new Date().toISOString(),
    },
  ];
};

export const updateCourseSettings = async (
  courseId: number,
  input: UpdateCourseWithdrawalSettingsInput,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!input.sectionId) {
    throw new Error("sectionId is required");
  }

  const existing = mockSectionSettings.find(
    (s) => s.courseId === courseId && s.sectionId === input.sectionId,
  );
  if (!existing) {
    throw new Error("course withdrawal settings does not exist");
  }

  mockSectionSettings = mockSectionSettings.map((s) =>
    s === existing
      ? {
          ...s,
          ...input,
          updatedBy: "Admin",
          updatedAt: new Date().toISOString(),
        }
      : s,
  );
};

export const batchUpdateCourseSettings = async (
  courseId: number,
  input: BatchUpdateCourseWithdrawalSettingsInput,
): Promise<void> => {
  if (!input.sectionIds?.length) {
    throw new Error("sectionIds must be a non-empty array");
  }

  await Promise.all(
    input.sectionIds.map(async (sectionId) => {
      try {
        await updateCourseSettings(courseId, { ...input, sectionId });
      } catch {
        // best-effort: one bad section shouldn't block the rest of the batch
      }
    }),
  );
};

export const getSectionSettings = async (
  courseId: number,
  sectionId: number,
): Promise<CourseWithdrawalSettingsDetailDto> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const existing = mockSectionSettings.find(
    (s) => s.courseId === courseId && s.sectionId === sectionId,
  );
  if (!existing) {
    throw new Error("course withdrawal settings does not exist");
  }

  return existing;
};

export const createSectionSettings = async (
  courseId: number,
  sectionId: number,
  input: CreateSectionWithdrawalSettingsInput,
): Promise<void> => {
  return createCourseSettings(courseId, { ...input, sectionId });
};

export const updateSectionSettings = async (
  courseId: number,
  sectionId: number,
  input: UpdateSectionWithdrawalSettingsInput,
): Promise<void> => {
  return updateCourseSettings(courseId, { ...input, sectionId });
};
