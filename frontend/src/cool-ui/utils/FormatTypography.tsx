import { type FC } from "react";
import { useIntl } from "react-intl";
import { Box } from "@mui/material";
import { textFormatter } from "./typography.utils";

type FormatTypographyProps = {
  id: string;
  textAlign?: "center" | "left" | "right";
};

/**
 * 【FormatTypography 翻譯訊息樣式套用】
 * 此元件特別用於將 i18n 翻譯訊息轉換為對應的文字，並且能自動套用對應的樣式。
 *
 * @coolUI
 * @prop {string} id - 翻譯訊息的 id。
 * @prop {'center' | 'left' | 'right'} textAlign - 文字對齊方式。
 */
export const FormatTypography: FC<FormatTypographyProps> = (
  props: FormatTypographyProps,
) => {
  const { formatMessage: f } = useIntl();
  return (
    <Box
      sx={{
        whiteSpace: "pre-line",
        overflowWrap: "break-word",
        textAlign: props.textAlign,
      }}
    >
      {f({ id: props.id }, textFormatter)}
    </Box>
  );
};
