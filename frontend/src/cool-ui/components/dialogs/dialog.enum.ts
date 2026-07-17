export const StepperStatus = {
  Start: "Start",
  InProgress: "InProgress",
  Loading: "Loading",
  Result: "Result",
} as const;
export type StepperStatus = (typeof StepperStatus)[keyof typeof StepperStatus];

export const ExecutionStatus = {
  Start: "Start",
  Loading: "Loading",
  Success: "Success",
  Failed: "Failed",
} as const;
export type ExecutionStatus =
  (typeof ExecutionStatus)[keyof typeof ExecutionStatus];
