import { type RefObject } from "react";
import { type default as Quill } from "quill";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  QuillEditor,
  type QuillEditorProps,
} from "../../cool-ui/components/editor/QuillEditor";
import { maxNoticeInputLength } from "../constants";

type NoticeEditorFieldProps = {
  quillRef: RefObject<Quill | null>;
  label?: string;
  disabled?: boolean;
  noticeLength: number;
  onTextChange: QuillEditorProps["onTextChange"];
};

export const NoticeEditorField = ({
  quillRef,
  label,
  disabled = false,
  noticeLength,
  onTextChange,
}: NoticeEditorFieldProps) => {
  const isOverLimit = !disabled && noticeLength > maxNoticeInputLength;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {label && (
        <Typography
          variant="subtitle2"
          color="textSecondary"
          sx={{ fontWeight: 500, mb: 2, mt: 1 }}
        >
          {label}
        </Typography>
      )}
      <QuillEditor
        ref={quillRef}
        placeholder={"(選填) 請輸入針對此課程的停修規範或提醒事項"}
        height={400}
        disabled={disabled}
        error={isOverLimit}
        onTextChange={onTextChange}
      />
      {!disabled && (
        <Typography
          variant="caption"
          color={isOverLimit ? "error" : "textSecondary"}
          sx={{ alignSelf: "flex-end" }}
        >
          {noticeLength} / {maxNoticeInputLength}
        </Typography>
      )}
    </Box>
  );
};
