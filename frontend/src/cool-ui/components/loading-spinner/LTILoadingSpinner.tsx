import { Backdrop, CircularProgress } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { FC } from "react";

type LTILoadingSpinnerProps = {
  show: boolean;
  sx?: SxProps;
};

/**
 * 【LTI 頁面載入動畫】
 *
 * 此載入動畫可用於將整個 LTI 頁面覆蓋，或是在特定區塊顯示載入動畫。
 *
 * 如果需在特定區塊顯示載入動畫，請傳入 position: 'relative' 的樣式。
 *
 * @coolUI
 * @prop {boolean} show - 是否顯示載入動畫
 * @prop {SxProps} sx - 自訂樣式
 *
 **/
export const LTILoadingSpinner: FC<LTILoadingSpinnerProps> = (
  props: LTILoadingSpinnerProps,
) => {
  const { show, sx } = props;
  return (
    // The Backdrop z-index is -1 by default.
    <Backdrop open={show} style={{ zIndex: 1501 }} sx={sx}>
      <CircularProgress size="6rem" thickness={6} />
    </Backdrop>
  );
};
