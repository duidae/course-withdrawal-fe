import { Box, Stack } from "@mui/material";
import { useMemo, type ReactElement } from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";

import styles from "./FileDropzone.module.scss";

type FileDropzoneProps = DropzoneOptions & {
  children: ReactElement;
};

export const FileDropzone = ({
  children,
  ...reactDropzoneProps
}: FileDropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } =
    useDropzone(reactDropzoneProps);
  const outerStyle = useMemo(
    () => `${styles["dropzone-outer"]} ${isDragActive ? styles["active"] : ""}`,
    [isDragActive],
  );

  return (
    <Box {...getRootProps()} className={outerStyle}>
      <input type="hidden" {...getInputProps()} />
      <Stack
        sx={{
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </Stack>
    </Box>
  );
};
