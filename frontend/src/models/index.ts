export const BaseWithdrawalStatus = {
  PENDING: "pending",
  OVERDUE: "overdue",
  APPROVED: "approved",
  DECLINED: "declined",
  NOTSUBMITTED: "notSubmitted",
} as const;

export type BaseWithdrawalStatus =
  (typeof BaseWithdrawalStatus)[keyof typeof BaseWithdrawalStatus];

export type Withdrawal = {
  id: number;
  name: string;
  school: string;
  studentId: string;
  loginId: string;
  applyTime: string;
  deadline: string;
  reason: string;
  status: BaseWithdrawalStatus;
  reviewTime?: string;
  approver?: string;
  lastModified?: number;
  _orig?: string;
};
