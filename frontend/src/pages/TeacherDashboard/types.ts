export type StudentRow = {
  id: number;
  name: string;
  school: string;
  studentId: string;
  applyTime: string;
  deadline: string;
  reason: string;
  status: string;
  approvalTime?: string;
  approver?: string;
  lastModified?: number;
  _orig?: string;
};

export type StudentRowWithOrig = StudentRow & { _orig: string };

export type TruncatedReasonProps = {
  text: string;
  onReadMore: () => void;
};

import { BaseWithdrawalStatus } from "../../models";

export const statusOrder: Record<string, number> = {
  待審核: 1,
  逾期審核: 2,
  同意: 3,
  不同意: 4,
};

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
