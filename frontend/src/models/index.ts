export const BaseWithdrawalStatus = {
  PENDING: "pending",
  OVERDUE: "overdue",
  APPROVED: "approved",
  DECLINED: "declined",
  NOTSUBMITTED: "notSubmitted",
  NOTSTARTED: "notStarted",
  NOTENABLED: "notEnabled",
} as const;

export type BaseWithdrawalStatus =
  (typeof BaseWithdrawalStatus)[keyof typeof BaseWithdrawalStatus];

export type WithdrawalDto = {
  id?: string;
  sectionId?: number;
  status: BaseWithdrawalStatus;
  courseName?: string;
  sectionName?: string;
  teachers?: string[];
  startAt?: string;
  endAt?: string;
  reviewDeadline?: string;
  studentName?: string;
  loginId?: string;
  studentId?: string;
  reason?: string;
  submittedAt?: string;
  reviewComment?: string;
  reviewerName?: string;
  reviewedAt?: string;
  notice?: object;
};

export type CourseWithdrawalSettingsInfoDto = {
  term: string;
  courseName: string;
  courseId: number;
  sectionId: number;
  withdrawalCount: number;
  enabled: boolean;
  startAt: string | null;
  endAt: string | null;
  reviewDeadline: string | null;
  updatedBy: string;
  updatedAt: string;
};

export type CourseWithdrawalSettingsDetailDto = {
  courseId: number;
  sectionId: number;
  startAt: string | null;
  endAt: string | null;
  reviewDeadline?: string | null;
  noticeDelta?: object | null;
  enabled: boolean | null;
  updatedBy: string;
  updatedAt: string;
};
