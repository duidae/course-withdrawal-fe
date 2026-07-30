import { useIntl } from "react-intl";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, Typography } from "@mui/material";

type CourseTimelineProps = {
  sectionEnabled: boolean;
  st: string;
  et: string;
  ad: string;
};

const tableCellStyle = {
  border: "1px solid",
  borderColor: "divider",
  padding: "6px 16px",
  lineHeight: 1.66,
};

export const CourseTimeline = ({
  sectionEnabled,
  st,
  et,
  ad,
}: CourseTimelineProps) => {
  const { formatMessage: f } = useIntl();

  const items = [
    {
      label: f({ id: "studentDashboard.timeline.start" }),
      value: sectionEnabled ? st : "-",
    },
    {
      label: f({ id: "studentDashboard.timeline.end" }),
      value: sectionEnabled ? et : "-",
    },
    {
      label: f({ id: "studentDashboard.timeline.teacherDeadline" }),
      value: sectionEnabled ? ad : "-",
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
                  <Typography variant="caption">{item.value}</Typography>
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
                  <Typography variant="caption">{item.value}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </>
  );
};
