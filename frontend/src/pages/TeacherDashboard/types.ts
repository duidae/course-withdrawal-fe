import { type WithdrawalDto } from "../../models";

export type StudentRow = Omit<
  WithdrawalDto,
  | "id"
  | "studentName"
  | "reason"
  | "teachers"
  | "startAt"
  | "endAt"
  | "reviewDeadline"
  | "reviewComment"
  | "notice"
> & {
  id: string;
  studentName: string;
  reason: string;
  reviewDeadline: string;
  lastModified?: number;
};
