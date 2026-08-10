// TODO: replace StudentRow with Withdrawal
export type StudentRow = {
  id: number;
  courseName?: string;
  studentName: string;
  sectionName: string;
  loginId?: string;
  studentId: string;
  submittedAt: string;
  deadline: string;
  reason: string;
  status: BaseWithdrawalStatus;
  reviewedAt?: string;
  reviewerName?: string;
  lastModified?: number;
  _orig?: string;
};

export type StudentRowWithOrig = StudentRow & { _orig: string };

export type TruncatedReasonProps = {
  text: string;
  onReadMore: () => void;
};

import { BaseWithdrawalStatus } from "../../models";

export const WithdrawalStatus = {
  ALL: "all",
  ...BaseWithdrawalStatus,
} as const;

export type WithdrawalStatus =
  (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus];

export type SelectOption = {
  value: string;
  label: string;
};

export type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  width: number;
  disabled?: boolean;
};
