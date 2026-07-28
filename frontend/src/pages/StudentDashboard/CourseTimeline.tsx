import { useIntl } from "react-intl";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

type CourseTimelineProps = {
  sectionEnabled: boolean;
  st: string;
  et: string;
  ad: string;
};

export const CourseTimeline = ({
  sectionEnabled,
  st,
  et,
  ad,
}: CourseTimelineProps) => {
  const { formatMessage: f } = useIntl();

  return (
    <Paper variant="outlined" sx={{ display: "flex", width: "100%" }}>
      {[
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
      ].map((item, i, arr) => (
        <Box
          key={item.label}
          sx={{
            flex: 1,
            borderRight: i < arr.length - 1 ? "1px solid" : "none",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: "block",
              padding: "6px 16px",
              borderBottom: "1px solid",
              borderColor: "divider",
              letterSpacing: "0.4px",
            }}
          >
            {item.label}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              padding: "6px 16px",
              letterSpacing: "0.4px",
            }}
          >
            {item.value}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};
