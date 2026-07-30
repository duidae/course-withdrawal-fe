export type CourseSettings = {
  name: string;
  section: string;
  teachers: string[];
  st: string;
  et: string;
  ad: string;
  notes: string;
  isEnabled?: boolean;
};

export type Application = {
  status: string;
  reason?: string;
  applyTime?: string;
  comment?: string;
  approver?: string;
  reviewTime?: string;
};
