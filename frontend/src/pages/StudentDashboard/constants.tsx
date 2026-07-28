import { type ReactNode } from "react";
import Box from "@mui/material/Box";

export const noticeFormatter = {
  r: (chunks: ReactNode[]) => (
    <Box component="span" sx={{ color: "error.main" }}>
      {chunks}
    </Box>
  ),
};
