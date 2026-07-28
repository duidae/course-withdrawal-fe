import { useIntl } from "react-intl";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { noticeFormatter } from "./constants";

export const NoticeContent = () => {
  const { formatMessage: f } = useIntl();

  return (
    <Stack spacing={1.5} sx={{ fontSize: 16, lineHeight: 1.5 }}>
      <Typography variant="body1">
        {f({ id: "studentDashboard.notice.greeting" })}
      </Typography>
      <Typography variant="body1">
        {f({ id: "studentDashboard.notice.rule" })}
      </Typography>
      <Typography variant="body1">
        {f({ id: "studentDashboard.notice.schedule" })}
      </Typography>
      <Typography variant="body1">
        {f({ id: "studentDashboard.notice.deletion" })}
      </Typography>
      <Stack spacing={1.25}>
        <Typography variant="body1">
          {f({ id: "studentDashboard.notice.attentionTitle" })}
        </Typography>
        <Box component="ul" sx={{ margin: 0, paddingLeft: "20px" }}>
          <Typography component="li" variant="body1" sx={{ mb: 1.25 }}>
            {f({ id: "studentDashboard.notice.attention1" }, noticeFormatter)}
          </Typography>
          <Typography component="li" variant="body1">
            {f({ id: "studentDashboard.notice.attention2" }, noticeFormatter)}
          </Typography>
        </Box>
      </Stack>
      <Stack spacing={0.25}>
        <Typography variant="body1">
          {f({ id: "studentDashboard.notice.closing1" })}
        </Typography>
        <Typography variant="body1">
          {f({ id: "studentDashboard.notice.closing2" })}
        </Typography>
        <Typography variant="body1">
          {f({ id: "studentDashboard.notice.closing3" })}
        </Typography>
      </Stack>
      <Stack spacing={0.25}>
        <Typography variant="body1">
          {f({ id: "studentDashboard.notice.signature1" })}
        </Typography>
        <Typography variant="body1">
          {f({ id: "studentDashboard.notice.signature2" })}
        </Typography>
        <Typography variant="body1">
          {f({ id: "studentDashboard.notice.signature3" })}
        </Typography>
      </Stack>
    </Stack>
  );
};
