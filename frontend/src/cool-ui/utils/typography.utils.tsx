import React from "react";
import { Typography, type TypographyProps } from "@mui/material";
import { type IntlFormatters } from "react-intl";

type FormatXMLElementFns = Parameters<
  IntlFormatters<React.ReactNode>["formatMessage"]
>[1];

const variants: Required<TypographyProps["variant"][]> = [
  "highlight",
  "critical",
  "warning",
  "success",
  "caution",
  "disabled",
];

export const textFormatter = (() => {
  const formatter: FormatXMLElementFns = {};

  for (const variant of variants) {
    formatter[variant] = (parts: React.ReactNode[]) => (
      <Typography variant={variant}>{parts}</Typography>
    );
  }

  return formatter;
})();
