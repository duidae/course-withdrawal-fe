import { type ReactNode } from "react";

export const statusOrder: Record<string, number> = {
  待審核: 1,
  逾期審核: 2,
  同意: 3,
  不同意: 4,
};

export const pendingCountFormatter = {
  red: (chunks: ReactNode[]) => (
    <span style={{ color: "#cc0000" }}>{chunks}</span>
  ),
};

export const columns = [
  {
    key: "studentName",
    label: "teacherDashboard.field.studentName",
    width: 100,
  },
  {
    key: "class",
    label: "teacherDashboard.field.class",
    width: 110,
  },
  {
    key: "studentId",
    label: "teacherDashboard.field.studentId",
    width: 128,
  },
  {
    key: "applyTime",
    label: "teacherDashboard.field.applyTime",
    width: 96,
  },
  {
    key: "reason",
    label: "teacherDashboard.field.reason",
    width: 160,
  },
  {
    key: "decision",
    label: "teacherDashboard.field.decision",
    width: 100,
  },
  {
    key: "deadline",
    label: "teacherDashboard.field.deadline",
    width: 96,
  },
  {
    key: "approvalTime",
    label: "teacherDashboard.field.approvalTime",
    width: 96,
  },
  {
    key: "approver",
    label: "teacherDashboard.field.approver",
    width: 80,
  },
  {
    key: "action",
    label: "teacherDashboard.field.action",
    width: 50,
  },
];

export const cellSx = {
  padding: "8px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
};
