import { BaseWithdrawalStatus } from "../models";

export const maxTextInputLength = 500;
export const maxNoticeInputLength = 5000;
export const defaultPageSize = 100;
export const pageSizeOptions = [25, 50, defaultPageSize];
export const statusOrder: Record<string, number> = {
  [BaseWithdrawalStatus.PENDING]: 1,
  [BaseWithdrawalStatus.OVERDUE]: 2,
  [BaseWithdrawalStatus.APPROVED]: 3,
  [BaseWithdrawalStatus.DECLINED]: 4,
};
