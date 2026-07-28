export type CourseSettings = {
  st: string;
  et: string;
  ad: string;
  notes: string;
  vis?: boolean;
};

export type Application = {
  status: string;
  reason?: string;
  applyTime?: string;
  comment?: string;
  approver?: string;
  reviewTime?: string;
};
