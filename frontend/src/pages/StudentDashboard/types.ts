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
  submittedAt?: string;
  comment?: string;
  approver?: string;
  reviewerName?: string;
  reviewedAt?: string;
};
