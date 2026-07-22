import Chip from "@mui/material/Chip";
import { chipSt } from "../../apis/mockup";
import { type StatusChipProps } from "./types";

export const StatusChip = ({
  status,
  label: labelOverride,
}: StatusChipProps) => {
  const s = chipSt[status as keyof typeof chipSt] || chipSt["未申請"];
  const label = labelOverride ?? status;
  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        height: 24,
        fontSize: 13,
        whiteSpace: "nowrap",
        color: s.color,
        backgroundColor: s.background,
        border: s.border,
        ...("opacity" in s ? { opacity: s.opacity } : {}),
      }}
    />
  );
};
