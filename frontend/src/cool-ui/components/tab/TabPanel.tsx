import React, { type FC } from "react";
import { Box } from "@mui/material";

type TabPanelProps = {
  children?: React.ReactNode;
  panel: string | number;
  currentPanel: string | number;
};

/**
 * 【TabPanel 切換面板】
 *
 * TabPanel 用於製作切換 Tab 時顯示的「切換面板」。
 * 當 panel 與 currentPanel 相等時，才會顯示 children。
 *
 * 這個元件不能單獨出現，必須搭配 [MUI-Tabs](https://mui.com/material-ui/react-tabs/) 使用。
 * 使用時建議定義好 enum，以做為 panel 的編號（number | string）。
 *
 * @coolUI
 * @prop {React.ReactNode} children - 子元素
 * @prop {number} panel - 面板編號
 * @prop {number} currentPanel - 目前面板編號
 */
export const TabPanel: FC<TabPanelProps> = (props: TabPanelProps) => {
  const { children, panel, currentPanel } = props;

  return (
    <Box
      role="tabpanel"
      hidden={panel !== currentPanel}
      sx={{ width: "100%", height: "100%" }}
    >
      {children}
    </Box>
  );
};
