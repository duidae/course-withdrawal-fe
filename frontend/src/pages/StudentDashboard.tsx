import { useState, type ReactNode } from "react";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";

type AccordionItemProps = {
  title: string;
  children: ReactNode;
  noBorderTop?: boolean;
};

const AccordionItem = ({
  title,
  children,
  noBorderTop = false,
}: AccordionItemProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ borderTop: noBorderTop ? "none" : "1px solid rgba(0,0,0,0.12)" }}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "none",
          border: "none",
          borderBottom: open ? "1px solid rgba(0,0,0,0.12)" : "none",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 12, color: "#333" }}>{title}</span>
        <span
          style={{
            fontSize: 16,
            color: "#666",
            display: "inline-block",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          ▾
        </span>
      </button>
      {open && <div style={{ padding: "16px" }}>{children}</div>}
    </div>
  );
};

const NoticeContent = () => {
  const R = ({ children }: { children: ReactNode }) => (
    <span style={{ color: "#CC0000" }}>{children}</span>
  );
  return (
    <div style={{ fontSize: 16, lineHeight: 1.5, color: "#333" }}>
      <p style={{ margin: "0 0 12px" }}>各位 TAICA 盟校同學好：</p>
      <p style={{ margin: "0 0 12px" }}>
        依據 TAICA 計畫辦公室的規範，TAICA
        盟校學生如欲退選「生成式人工智慧與機器學習導論」之鏡像課程，需經過主授教師的同意。
      </p>
      <p style={{ margin: "0 0 12px" }}>
        本頁面上方已提供同學需完成「期中停修意願申請表單」的填寫時程、以及主授教師需完成核准的時程供您參考。
      </p>
      <p style={{ margin: "0 0 12px" }}>
        NTU COOL 團隊將在 11/19 (三)
        下班前，依照主授老師於本表單的核定結果，將主授教師同意的退選同學從課程中刪除。
      </p>
      <p style={{ margin: "0 0 8px" }}>敬請同學留意：</p>
      <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>
        <li style={{ marginBottom: 10 }}>
          「期中停修意願申請表單」<R>僅能填寫一次</R>，且送出後<R>無法撤回</R>
          。送出前，請務必核對所填寫之表單上的<R>課名</R>
          ，是否為所欲申請停修的課程，以及確認填答內容是否正確。
          <R>敬請確認填寫內容皆正確再送出</R>。
        </li>
        <li>
          依據 TAICA 計畫辦公室的規定，
          <R>
            同學一旦完成在 NTU COOL
            上的「期中停修意願申請表單」的填寫並獲主授教師同意，即視為已經完成停修手續。
          </R>
          後續同學需自行依照所屬學校的退選流程完成校內停修手續。若有同學有填寫表單且獲主授教師同意，但並未確實依照所屬學校的停修流程，完成校內停修手續，若有任何後果同學需自行負責。
        </li>
      </ul>
      <p style={{ margin: "0 0 2px" }}>以上說明，</p>
      <p style={{ margin: "0 0 2px" }}>
        若有任何與表單填寫相關之問題，歡迎來信或來電詢問 NTU COOL 團隊；
      </p>
      <p style={{ margin: "0 0 12px" }}>
        如有任何期中停修相關行政問題，請洽貴校 TAICA 窗口，謝謝您。
      </p>
      <p style={{ margin: "0 0 2px" }}>NTU COOL 平臺團隊 敬上</p>
      <p style={{ margin: "0 0 2px" }}>ntucool@ntu.edu.tw</p>
      <p style={{ margin: 0 }}>02-3366-3367 #594</p>
    </div>
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

  const noticeContent = cs.notes ? (
    <div
      className="ql-editor"
      style={{
        padding: 0,
        fontSize: 16,
        color: "#333",
        lineHeight: 1.5,
        minHeight: "auto",
      }}
      dangerouslySetInnerHTML={{ __html: cs.notes }}
    />
  ) : (
    <NoticeContent />
  );

  return (
    <div style={{ padding: "24px 24px 64px" }}>
      {/* ── Title row: h1 + status chip ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 400,
            color: "#333",
            letterSpacing: "-1.5px",
            margin: 0,
          }}
        >
          停修申請
        </h1>
        <Chip label={application.status} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  color: "#333",
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                課程名稱：深度學習 Deep Learning
              </p>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  color: "#333",
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                班別：國立成功大學
              </p>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  color: "#333",
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                授課教師：彭文孝、陳永昇、謝秉均
              </p>
            </div>

            <div
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 4,
                display: "flex",
                width: "100%",
              }}
            >
              {[
                ["申請開始時間", sectionEnabled ? cs.st : "-"],
                ["申請截止時間", sectionEnabled ? cs.et : "-"],
                ["教師審核期限", sectionEnabled ? cs.ad : "-"],
              ].map(([l, v], i, a) => (
                <div
                  key={l}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    borderRight:
                      i < a.length - 1 ? "1px solid rgba(0,0,0,0.12)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#333",
                      padding: "6px 16px",
                      borderBottom: "1px solid rgba(0,0,0,0.12)",
                      letterSpacing: "0.4px",
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#333",
                      padding: "6px 16px",
                      letterSpacing: "0.4px",
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <p
                style={{
                  fontSize: 12,
                  color: "#333",
                  lineHeight: 1.66,
                  margin: 0,
                }}
              >
                學生姓名：陳O佑
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#333",
                  lineHeight: 1.66,
                  margin: 0,
                }}
              >
                登入ID：F34097391@mail.ncku.edu.tw
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#333",
                  lineHeight: 1.66,
                  margin: 0,
                }}
              >
                學號：成大_F34097391
              </p>
            </div>

            {!sectionEnabled ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "6px 16px",
                  border: "1px solid #006699",
                  borderRadius: 4,
                  background: "white",
                }}
              >
                <div
                  style={{
                    padding: "7px 12px 7px 0",
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  <InfoIcon />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    padding: "8px 0",
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#014361",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    停修功能未開放
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: "#014361",
                      lineHeight: 1.43,
                      margin: 0,
                    }}
                  >
                    您無法透過 COOL 申請課程停修，請逕洽您的校務選課系統辦理。
                  </p>
                </div>
              </div>
            ) : hasSubmitted ? (
              <div
                style={{
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 4,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                }}
              >
                {application.status === "同意" ||
                application.status === "不同意" ||
                application.status === "逾期審核" ? (
                  <>
                    <AccordionItem title="停修原因" noBorderTop>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 12,
                            color: "#333",
                            lineHeight: 1.66,
                            margin: 0,
                          }}
                        >
                          {application.reason}
                        </p>
                        {application.applyTime && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "#333",
                              lineHeight: 1.66,
                              margin: 0,
                            }}
                          >
                            - 申請時間：{application.applyTime}
                          </p>
                        )}
                      </div>
                    </AccordionItem>
                    <AccordionItem title="審核評語">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 12,
                            color: "#333",
                            lineHeight: 1.66,
                          }}
                        >
                          {application.comment || "- 無"}
                        </p>
                        {application.approver && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "#333",
                              lineHeight: 1.66,
                            }}
                          >
                            - 審核人 {application.approver}
                          </p>
                        )}
                        {application.reviewTime && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "#333",
                              lineHeight: 1.66,
                            }}
                          >
                            - 審核時間：{application.reviewTime}
                          </p>
                        )}
                      </div>
                    </AccordionItem>
                  </>
                ) : (
                  <AccordionItem title="停修原因" noBorderTop>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          color: "#333",
                          lineHeight: 1.66,
                          margin: 0,
                        }}
                      >
                        {application.reason}
                      </p>
                      {application.applyTime && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "#333",
                            lineHeight: 1.66,
                            margin: 0,
                          }}
                        >
                          - 申請時間：{application.applyTime}
                        </p>
                      )}
                    </div>
                  </AccordionItem>
                )}
              </div>
            ) : isAppExpired ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "6px 16px",
                  border: "1px solid #CC0000",
                  borderRadius: 4,
                  background: "white",
                }}
              >
                <div
                  style={{
                    padding: "7px 12px 7px 0",
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  <ErrorIcon color="error" />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    padding: "8px 0",
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#5F2120",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    已超過停修申請時間
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#5F2120",
                      lineHeight: 1.43,
                      margin: 0,
                    }}
                  >
                    您已無法透過 COOL 申請此課程停修，請聯繫課程授課教師。
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <TextField
                  multiline
                  rows={4}
                  label="停修原因"
                  value={reason}
                  onChange={(e) =>
                    e.target.value.length <= 500 && setReason(e.target.value)
                  }
                />
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(51,51,51,0.6)",
                    textAlign: "right",
                    margin: 0,
                  }}
                >
                  {reason.length} / 500
                </p>
              </div>
            )}
          </div>

          <div
            style={{ height: 1, background: "rgba(0,0,0,0.12)", margin: "0" }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#333",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              申請停修注意事項
            </p>
            <div
              style={{
                border: "1px solid #E0E0E0",
                borderRadius: 4,
                padding: 16,
                background: "white",
              }}
            >
              {noticeContent}
            </div>
          </div>

          {!hasSubmitted && !isAppExpired && sectionEnabled && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                style={{
                  accentColor: "#0099cc",
                  width: 16,
                  height: 16,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, color: "#333" }}>
                我已詳讀停修規範並確認停修該課程
                <span style={{ color: "#D63333" }}>*</span>
              </span>
            </label>
          )}
        </div>

        {!hasSubmitted && !isAppExpired && sectionEnabled && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              disabled={isDisabled}
              onClick={() => !isDisabled && onSubmit?.(reason)}
              className="mui-btn mui-contained-primary"
              style={{
                background: isDisabled ? "rgba(0,0,0,0.12)" : "#0099cc",
                color: isDisabled ? "rgba(0,0,0,0.38)" : "white",
                border: "none",
                borderRadius: 4,
                padding: "8px 22px",
                fontSize: 17,
                fontWeight: 500,
                cursor: isDisabled ? "default" : "pointer",
                letterSpacing: "0.027em",
              }}
            >
              提交申請
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
