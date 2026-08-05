import { CourseWithdrawalStatus } from '../database/course-withdrawal-db/entities/course-withdrawal-status.enum';

export const WithdrawalStatus = {
  ...CourseWithdrawalStatus,
  NotSubmitted: 'notSubmitted',
  NotStarted: 'notStarted',
  NotEnabled: 'notEnabled',
  Overdue: 'overdue',
} as const;

export type WithdrawalStatus = (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus];

export type Withdrawal = {
  status: WithdrawalStatus;
  courseName?: string;
  sectionName?: string;
  teachers?: string[];
  studnetName?: string;
  loginId?: string;
  studentId?: string;
  reason?: string;
  submittedAt?: Date;
  endAt?: Date;
  reviewComment?: string;
  reviewerName?: string;
  reviewedAt?: Date;
  notice?: object;
};

export type CreateWithdrawalInput = {
  reason: string;
  studentName?: string;
  courseName?: string;
};

export type ReviewWithdrawalInput = {
  status: CourseWithdrawalStatus.Approved | CourseWithdrawalStatus.Declined;
  reviewComment?: string;
};

export type BatchReviewWithdrawalInput = {
  studentCanvasIds: string[];
  status: CourseWithdrawalStatus.Approved | CourseWithdrawalStatus.Declined;
  reviewComment?: string;
};

export type BatchReviewResult = {
  studentCanvasId: string;
  success: boolean;
  withdrawal?: Withdrawal;
  error?: string;
};

export type CourseInfo = {
  sectionId: string;
  sectionName: string;
  teachers: string[];
};

export type CourseWithdrawalSettingsInfo = {
  term: string;
  courseName: string;
  courseId: string;
  withdrawalCount: number;
  enabled: boolean;
};

export type UserInfo = {
  name: string;
  loginId: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};
