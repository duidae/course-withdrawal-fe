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
