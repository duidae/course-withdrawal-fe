import { useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type AccordionItemProps = {
  title: string;
  children: ReactNode;
};

const AccordionItem = ({ title, children }: AccordionItemProps) => (
  <Accordion disableGutters elevation={0} square>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="caption">{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);

const R = ({ children }: { children: ReactNode }) => (
  <Box component="span" sx={{ color: "error.main" }}>
    {children}
  </Box>
);

const NoticeContent = () => {
  return (
    <Stack spacing={1.5} sx={{ fontSize: 16, lineHeight: 1.5 }}>
      <Typography variant="body1">各位 TAICA 盟校同學好：</Typography>
      <Typography variant="body1">
        依據 TAICA 計畫辦公室的規範，TAICA
        盟校學生如欲退選「生成式人工智慧與機器學習導論」之鏡像課程，需經過主授教師的同意。
      </Typography>
      <Typography variant="body1">
        本頁面上方已提供同學需完成「期中停修意願申請表單」的填寫時程、以及主授教師需完成核准的時程供您參考。
      </Typography>
      <Typography variant="body1">
        NTU COOL 團隊將在 11/19 (三)
        下班前，依照主授老師於本表單的核定結果，將主授教師同意的退選同學從課程中刪除。
      </Typography>
      <Stack spacing={1.25}>
        <Typography variant="body1">敬請同學留意：</Typography>
        <Box component="ul" sx={{ margin: 0, paddingLeft: "20px" }}>
          <Typography component="li" variant="body1" sx={{ mb: 1.25 }}>
            「期中停修意願申請表單」<R>僅能填寫一次</R>，且送出後<R>無法撤回</R>
            。送出前，請務必核對所填寫之表單上的<R>課名</R>
            ，是否為所欲申請停修的課程，以及確認填答內容是否正確。
            <R>敬請確認填寫內容皆正確再送出</R>。
          </Typography>
          <Typography component="li" variant="body1">
            依據 TAICA 計畫辦公室的規定，
            <R>
              同學一旦完成在 NTU COOL
              上的「期中停修意願申請表單」的填寫並獲主授教師同意，即視為已經完成停修手續。
            </R>
            後續同學需自行依照所屬學校的退選流程完成校內停修手續。若有同學有填寫表單且獲主授教師同意，但並未確實依照所屬學校的停修流程，完成校內停修手續，若有任何後果同學需自行負責。
          </Typography>
        </Box>
      </Stack>
      <Stack spacing={0.25}>
        <Typography variant="body1">以上說明，</Typography>
        <Typography variant="body1">
          若有任何與表單填寫相關之問題，歡迎來信或來電詢問 NTU COOL 團隊；
        </Typography>
        <Typography variant="body1">
          如有任何期中停修相關行政問題，請洽貴校 TAICA 窗口，謝謝您。
        </Typography>
      </Stack>
      <Stack spacing={0.25}>
        <Typography variant="body1">NTU COOL 平臺團隊 敬上</Typography>
        <Typography variant="body1">ntucool@ntu.edu.tw</Typography>
        <Typography variant="body1">02-3366-3367 #594</Typography>
      </Stack>
    </Stack>
  );
};

type CourseSettings = {
  st: string;
  et: string;
  ad: string;
  notes: string;
  vis?: boolean;
};

type StudentDashboardProps = {
  application: {
    status: string;
    reason?: string;
    applyTime?: string;
    comment?: string;
    approver?: string;
    reviewTime?: string;
  };
  onSubmit?: (value: string) => void;
  courseSettings?: CourseSettings;
};

export const StudentDashboard = ({
  application,
  onSubmit,
  courseSettings,
}: StudentDashboardProps) => {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const hasSubmitted = application.status !== "未申請";
  const isDisabled = !reason.trim() || !confirmed;
  const cs = courseSettings || {
    st: "2026/07/01 00:00",
    et: "2026/07/25 23:59",
    ad: "2026/08/08 23:59",
    notes: "",
  };
  const sectionEnabled = cs.vis !== false;
  const isAppExpired =
    !hasSubmitted && !sectionEnabled
      ? false
      : !hasSubmitted &&
        !!cs.et &&
        new Date(cs.et.replace(/\//g, "-").replace(" ", "T")) < new Date();
  const isReviewed =
    application.status === "同意" ||
    application.status === "不同意" ||
    application.status === "逾期審核";

  const noticeContent = cs.notes ? (
    <Box
      className="ql-editor"
      sx={{ padding: 0, fontSize: 16, lineHeight: 1.5, minHeight: "auto" }}
      dangerouslySetInnerHTML={{ __html: cs.notes }}
    />
  ) : (
    <NoticeContent />
  );

  const reasonAccordion = (
    <AccordionItem title="停修原因">
      <Stack spacing={1}>
        <Typography variant="caption">{application.reason}</Typography>
        {application.applyTime && (
          <Typography variant="caption">
            - 申請時間：{application.applyTime}
          </Typography>
        )}
      </Stack>
    </AccordionItem>
  );

  return (
    <Box sx={{ padding: "24px 24px 64px" }}>
      <Stack direction="row" spacing={3} sx={{ alignItems: "center", mb: 3 }}>
        <Typography variant="h1">停修申請</Typography>
        <Chip label={application.status} />
      </Stack>

      <Stack spacing={2}>
        <Stack spacing={5}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
                課程名稱：深度學習 Deep Learning
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
                班別：國立成功大學
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
                授課教師：彭文孝、陳永昇、謝秉均
              </Typography>
            </Box>

            <Paper variant="outlined" sx={{ display: "flex", width: "100%" }}>
              {[
                { label: "申請開始時間", value: sectionEnabled ? cs.st : "-" },
                { label: "申請截止時間", value: sectionEnabled ? cs.et : "-" },
                { label: "教師審核期限", value: sectionEnabled ? cs.ad : "-" },
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

            <Stack spacing={0.25}>
              <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
                學生姓名：陳O佑
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
                登入ID：F34097391@mail.ncku.edu.tw
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
                學號：成大_F34097391
              </Typography>
            </Stack>

            {!sectionEnabled ? (
              <Alert severity="info">
                <AlertTitle>停修功能未開放</AlertTitle>
                您無法透過 COOL 申請課程停修，請逕洽您的校務選課系統辦理。
              </Alert>
            ) : hasSubmitted ? (
              <Paper variant="outlined" sx={{ boxShadow: 1 }}>
                {isReviewed ? (
                  <>
                    {reasonAccordion}
                    <AccordionItem title="審核評語">
                      <Stack spacing={0.5}>
                        <Typography variant="caption">
                          {application.comment || "- 無"}
                        </Typography>
                        {application.approver && (
                          <Typography variant="caption">
                            - 審核人 {application.approver}
                          </Typography>
                        )}
                        {application.reviewTime && (
                          <Typography variant="caption">
                            - 審核時間：{application.reviewTime}
                          </Typography>
                        )}
                      </Stack>
                    </AccordionItem>
                  </>
                ) : (
                  reasonAccordion
                )}
              </Paper>
            ) : isAppExpired ? (
              <Alert severity="error">
                <AlertTitle>已超過停修申請時間</AlertTitle>
                您已無法透過 COOL 申請此課程停修，請聯繫課程授課教師。
              </Alert>
            ) : (
              <Stack spacing={1}>
                <TextField
                  multiline
                  rows={4}
                  label="停修原因"
                  value={reason}
                  onChange={(e) =>
                    e.target.value.length <= 500 && setReason(e.target.value)
                  }
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textAlign: "right" }}
                >
                  {reason.length} / 500
                </Typography>
              </Stack>
            )}
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              申請停修注意事項
            </Typography>
            <Paper variant="outlined" sx={{ padding: 2 }}>
              {noticeContent}
            </Paper>
          </Stack>

          {!hasSubmitted && !isAppExpired && sectionEnabled && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
              }
              label={
                <Typography variant="caption">
                  我已詳讀停修規範並確認停修該課程
                  <Box component="span" sx={{ color: "error.light" }}>
                    *
                  </Box>
                </Typography>
              }
            />
          )}
        </Stack>

        {!hasSubmitted && !isAppExpired && sectionEnabled && (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              disabled={isDisabled}
              onClick={() => onSubmit?.(reason)}
            >
              提交申請
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
