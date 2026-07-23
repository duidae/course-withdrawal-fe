export type Withdrawal = {
  id: number;
  name: string;
  school: string;
  studentId: string;
  loginId: string;
  applyTime: string;
  deadline: string;
  reason: string;
  status: string;
  approvalTime?: string;
  approver?: string;
  lastModified?: number;
  _orig?: string;
};
