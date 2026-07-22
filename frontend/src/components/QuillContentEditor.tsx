import { type FC } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import DOMPurify from "dompurify";
import "quill/dist/quill.snow.css";
import "./quill-editor.override.scss";

type QuillContentViewerProps = {
  content: string;
  maxHeight?: number | string;
  sx?: SxProps<Theme>;
};

export const QuillContentEditor: FC<QuillContentViewerProps> = ({
  content,
  maxHeight = 400,
  sx,
}) => {
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <Box
      className="main-terms-content"
      sx={{
        p: 2,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "divider",
        backgroundColor: "grey.50",
        ...sx,
      }}
    >
      <div className="quill">
        <div className="ql-container ql-snow" style={{ border: "none" }}>
          <div
            className="ql-editor"
            style={{ maxHeight, overflowY: "auto" }}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
      </div>
    </Box>
  );
};
