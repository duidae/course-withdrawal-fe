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

export type Withdrawal = {
  status: BaseWithdrawalStatus;
  courseName?: string;
  sectionName?: string;
  teachers?: string[];
  startAt?: string;
  endAt?: string;
  reviewDeadline?: string;
  studnetName?: string;
  loginId?: string;
  studentId?: string;
  reason?: string;
  submittedAt?: string;
  reviewComment?: string;
  reviewerName?: string;
  reviewedAt?: string;
  notice?: object;
};

export type CourseWithdrawalSettingsInfo = {
  term: string;
  courseName: string;
  courseId: number;
  withdrawalCount: number;
  enabled: boolean;
};
