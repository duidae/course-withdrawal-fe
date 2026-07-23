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

export type StatusChipProps = {
  status: string;
  label?: string;
};

export type TruncatedReasonProps = {
  text: string;
  onReadMore: () => void;
};

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
