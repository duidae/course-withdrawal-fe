import { type ReactNode } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type AccordionItemProps = {
  title: string;
  children: ReactNode;
};

export const AccordionItem = ({ title, children }: AccordionItemProps) => (
  <Accordion disableGutters elevation={0} square>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="body1">{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);
