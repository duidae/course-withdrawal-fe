import { type CSSProperties, type ReactNode } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

const defaultColor = "#0099CC";

type Course = {
  id: string;
  semester: string;
  courseId: string;
  courseName: string;
  vis?: boolean;
};

type TogProps = {
  on: boolean;
  onChange: () => void;
  disabled?: boolean;
};

function Tog({ on, onChange, disabled = false }: TogProps) {
  const isOn = disabled ? true : on;
  const trackBg = isOn ? "rgba(0,153,204,0.5)" : "rgba(0,0,0,0.38)";
  const thumbBg = isOn ? defaultColor : "#FAFAFA";
  return (
    <span
      onClick={disabled ? undefined : onChange}
      style={{
        display: "inline-block",
        width: 34,
        height: 14,
        borderRadius: 7,
        background: trackBg,
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background .2s",
        flexShrink: 0,
        verticalAlign: "middle",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: -3,
          left: isOn ? 16 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: thumbBg,
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          transition: "left .15s",
        }}
      />
    </span>
  );
}

type AdminBtnProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost" | "dk";
  icon?: "Plus" | "Edit" | "Close";
  style?: CSSProperties;
};

const AdminBtn = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  icon,
  style: st,
}: AdminBtnProps) => {
  const B = {
    height: 36,
    padding: "0 14px",
    borderRadius: 4,
    fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    gap: 5,
    whiteSpace: "nowrap",
    flexShrink: 0,
  } as const;
  const V: Record<NonNullable<AdminBtnProps["variant"]>, CSSProperties> = {
    primary: {
      ...B,
      background: disabled ? "#e0e0e0" : defaultColor,
      color: disabled ? "rgba(0,0,0,0.38)" : "white",
      border: "none",
    },
    outline: {
      ...B,
      background: "transparent",
      color: disabled ? "rgba(0,0,0,0.38)" : defaultColor,
      border: `1px solid ${disabled ? "rgba(0,0,0,0.12)" : "rgba(0,153,204,0.5)"}`,
    },
    ghost: { ...B, background: "none", color: defaultColor, border: "none" },
    dk: {
      ...B,
      background: "transparent",
      color: disabled ? "rgba(0,0,0,0.38)" : "rgba(0,0,0,0.87)",
      border: `1px solid ${disabled ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.23)"}`,
    },
  };
  const CN: Record<NonNullable<AdminBtnProps["variant"]>, string> = {
    primary: "mui-btn mui-contained-primary",
    outline: "mui-btn mui-outlined-primary",
    ghost: "mui-btn mui-text-primary",
    dk: "mui-btn mui-outlined-default",
  };
  const IconEl =
    icon === "Plus" ? (
      <AddIcon />
    ) : icon === "Edit" ? (
      <EditIcon />
    ) : icon === "Close" ? (
      <CloseIcon />
    ) : null;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={CN[variant]}
      style={{ ...V[variant], ...(st || {}) }}
    >
      {IconEl}
      {children}
    </button>
  );
};

type AdminDashboardProps = {
  courses: Course[];
  setCourses?: (courses: Course[]) => void;
  semester: string;
  setSemester: (semester: string) => void;
  cSearch: string;
  setCSearch: (value: string) => void;
  onEdit: (course: Course) => void;
  onAdd: () => void;
  onToggle: (course: Course) => void;
  appCounts?: Record<string, number>;
};

export const AdminDashboard = ({
  courses,
  semester,
  setSemester,
  cSearch,
  setCSearch,
  onEdit,
  onAdd,
  onToggle,
  appCounts,
}: AdminDashboardProps) => {
  const cErr = cSearch.length > 50 ? "字數上限為 50 字" : "";
  const filteredCourse = courses.filter(
    (c: Course) =>
      c.semester === semester &&
      (!cSearch.trim() ||
        c.courseName.toLowerCase().includes(cSearch.toLowerCase())),
  );
  return (
    <div>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 400,
          color: "#333",
          letterSpacing: "-1.5px",
          marginBottom: 22,
        }}
      >
        停修申請設定
      </h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Select
            label="學期"
            value={semester}
            onChange={(event) => setSemester(event.target.value)}
          >
            <MenuItem value={"114-2 (2026 Spring)"}>
              114-2 (2026 Spring)
            </MenuItem>
            <MenuItem value={"114-1 (2025 Fall)"}>114-1 (2025 Fall)</MenuItem>
          </Select>
          <TextField
            label="課程名稱"
            value={cSearch}
            onChange={(ev) => setCSearch(ev.target.value)}
            error={!!cErr}
            helperText={cErr || ""}
            style={{ width: 300 }}
          />
        </div>
        <AdminBtn onClick={onAdd} variant="outline" icon="Plus">
          新增課程
        </AdminBtn>
      </div>
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", height: 48 }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "0 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  width: 165,
                }}
              >
                學期
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "0 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  width: 88,
                }}
              >
                課程 ID
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "0 14px",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                課程名稱
              </th>
              <th
                style={{
                  textAlign: "center",
                  padding: "0 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  width: 80,
                }}
              >
                申請數
              </th>
              <th style={{ width: 100 }} />
            </tr>
          </thead>
          <tbody>
            {filteredCourse.map((c) => (
              <tr
                key={c.id}
                style={{ height: 50, borderTop: "1px solid rgba(0,0,0,0.06)" }}
              >
                <td style={{ padding: "0 14px", fontSize: 13 }}>
                  {c.semester}
                </td>
                <td style={{ padding: "0 14px", fontSize: 13 }}>
                  {c.courseId}
                </td>
                <td style={{ padding: "0 14px", fontSize: 13 }}>
                  {c.courseName}
                </td>
                <td
                  style={{
                    padding: "0 14px",
                    fontSize: 13,
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  {(appCounts && appCounts[c.id]) || 0}
                </td>
                <td style={{ padding: "0 14px", width: 100 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <button
                      onClick={() => onEdit(c)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 5,
                        display: "inline-flex",
                        alignItems: "center",
                        color: "rgba(0,0,0,0.54)",
                        borderRadius: "50%",
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <Tog on={c.vis !== false} onChange={() => onToggle(c)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!cErr && filteredCourse.length === 0 && (
          <div
            style={{
              padding: "16px 14px",
              fontSize: 14,
              color: "rgba(0,0,0,0.6)",
              textAlign: "center",
            }}
          >
            找不到符合搜尋條件的課程
          </div>
        )}
      </div>
    </div>
  );
};
