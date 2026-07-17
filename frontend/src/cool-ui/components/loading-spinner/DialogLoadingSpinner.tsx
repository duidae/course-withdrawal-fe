import { type FC } from "react";
import { Box, CircularProgress } from "@mui/material";

type DialogLoadingSpinnerProps = {
  show: boolean;
  size?: string;
  thickness?: number;
};

/**
 * 【DialogLoadingSpinner 對話框載入動畫】
 *
 * 此元件用於在對話框中顯示載入動畫。
 *
 * @coolUI
 * @prop {boolean} show - 是否顯示載入動畫
 * @prop {string} size - 圓圈直徑
 * @prop {number} thickness - 圓圈粗細
 *
 **/
export const DialogLoadingSpinner: FC<DialogLoadingSpinnerProps> = (
  props: DialogLoadingSpinnerProps,
) => {
  const { show, size = "4rem", thickness = 6 } = props;

  return (
    <>
      {show && (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={size} thickness={thickness} />
        </Box>
      )}
    </>
  );
};
