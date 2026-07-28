import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const R = ({ children }: { children: ReactNode }) => (
  <Box component="span" sx={{ color: "error.main" }}>
    {children}
  </Box>
);

export const NoticeContent = () => (
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
