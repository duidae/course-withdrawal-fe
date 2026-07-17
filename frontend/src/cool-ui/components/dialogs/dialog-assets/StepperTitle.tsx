import { type FC } from "react";
import { Step, StepIcon, StepLabel, Stepper } from "@mui/material";

type StepperTitleProps = {
  steps: string[];
  stepIndex: number;
};

export const StepperTitle: FC<StepperTitleProps> = (
  props: StepperTitleProps,
) => {
  const { steps, stepIndex } = props;

  return (
    <Stepper activeStep={stepIndex} alternativeLabel>
      {steps.map((label) => {
        return (
          <Step key={label}>
            <StepLabel StepIconComponent={StepIcon}>{label}</StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};
