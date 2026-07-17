import { Box, LinearProgress, Typography } from "@mui/material";
import type { Variant } from "@mui/material/styles/createTypography";
import type { FC } from "react";

type LinearProgressWithLabelProps = {
  value: number;
  variant?: Variant;
  height?: number;
  width?: string;
  borderRadius?: number;
};

/**
 * 【LinearProgressWithLabel 進度條（含標籤）】
 *
 * 用於顯示進度，右側會顯示進度百分比。
 *
 * @coolUI
 * @prop {number} value - 進度值。
 * @prop {Variant} variant - 標籤文字樣式。
 * @prop {number} - 高度。
 * @prop {string} - 寬度。
 * @prop {number} - 圓角半徑。
 */
export const LinearProgressWithLabel: FC<LinearProgressWithLabelProps> = (
  props: LinearProgressWithLabelProps,
) => {
  const { value, variant, height, width, borderRadius } = props;

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ mr: 1, width: "100%" }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{ height, width, borderRadius }}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant={variant || "body1"}
        >{`${Math.round(value)}%`}</Typography>
      </Box>
    </Box>
  );
};
