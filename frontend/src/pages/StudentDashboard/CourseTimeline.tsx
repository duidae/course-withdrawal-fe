import { useIntl } from "react-intl";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, Skeleton, Typography } from "@mui/material";
import { formatDate } from "../util";

type CourseTimelineProps = {
  isLoading?: boolean;
  startAt: string | undefined;
  endAt: string | undefined;
  reviewDeadline: string | undefined;
};

const tableCellStyle = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: "4px",
  padding: "6px 16px",
  lineHeight: 1.66,
};

export const CourseTimeline = ({
  isLoading,
  startAt,
  endAt,
  reviewDeadline,
}: CourseTimelineProps) => {
  const { formatMessage: f } = useIntl();
  const skeleton = (
    <Skeleton variant="text" width={120} sx={{ display: "inline-block" }} />
  );

  const items = [
    {
      label: f({ id: "studentDashboard.timeline.start" }),
      value: startAt ? formatDate(startAt) : "-",
    },
    {
      label: f({ id: "studentDashboard.timeline.end" }),
      value: endAt ? formatDate(endAt) : "-",
    },
    {
      label: f({ id: "studentDashboard.timeline.teacherDeadline" }),
      value: reviewDeadline ? formatDate(reviewDeadline) : "-",
    },
  ];

  return (
    <>
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <Table sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow>
              {items.map((item) => (
                <TableCell
                  key={item.label}
                  component="th"
                  scope="col"
                  sx={tableCellStyle}
                >
                  <Typography variant="caption">{item.label}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {items.map((item) => (
                <TableCell key={item.label} sx={tableCellStyle}>
                  <Typography variant="caption">
                    {isLoading ? skeleton : item.value}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        <Table sx={{ borderCollapse: "collapse" }}>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.label}>
                <TableCell component="th" scope="row" sx={tableCellStyle}>
                  <Typography variant="caption">{item.label}</Typography>
                </TableCell>
                <TableCell sx={tableCellStyle}>
                  <Typography variant="caption">
                    {isLoading ? skeleton : item.value}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </>
  );
};
