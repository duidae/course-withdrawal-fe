import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { useSnackbar } from "notistack";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Checkbox from "@mui/material/Checkbox";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import { alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import { withSnackbar } from "../../cool-ui/components/alert/SnackbarAlert";
import {
  getCourseSettings,
  getSectionSettings,
  updateSectionSettings,
  createSectionSettings,
  getSectionName,
} from "../../apis/course-withdrawal.api.mock";
import { type CourseWithdrawalSettingsInfoDto } from "../../models";
import { formatDate } from "../util";
import { BaseDialog } from "../../cool-ui/components/dialogs/BaseDialog";
import { SectionSettingsEditDialog } from "./SectionSettingsEditDialog";
import { BatchSettingsEditDialog } from "./BatchSettingsEditDialog";

type CourseSectionSettingsTableProps = {
  courseId: number;
};

const CourseSectionSettingsTableContent = ({
  courseId,
}: CourseSectionSettingsTableProps) => {
  const { formatMessage: f } = useIntl();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [sections, setSections] = useState<CourseWithdrawalSettingsInfoDto[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [newSectionIdInput, setNewSectionIdInput] = useState("");
  const [selectedSectionIds, setSelectedSectionIds] = useState<Set<number>>(
    new Set(),
  );
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [toggleOffTarget, setToggleOffTarget] =
    useState<CourseWithdrawalSettingsInfoDto | null>(null);

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const data = await getCourseSettings(courseId);
      setSections(data.filter((s) => s.courseId === courseId));
    } catch {
      enqueueSnackbar(f({ id: "adminDashboard.error.fetchFailed" }), {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const applyToggle = async (s: CourseWithdrawalSettingsInfoDto) => {
    try {
      await updateSectionSettings(courseId, s.sectionId, {
        enabled: !s.enabled,
      });
      setSections((prev) =>
        prev.map((section) =>
          section.sectionId === s.sectionId
            ? { ...section, enabled: !section.enabled }
            : section,
        ),
      );
      enqueueSnackbar(`已成功${!s.enabled ? "開啟" : "關閉"}班別停修功能`, {
        variant: "success",
      });
    } catch {
      enqueueSnackbar(`${!s.enabled ? "開啟" : "關閉"}班別停修功能失敗`, {
        variant: "error",
      });
    }
  };

  const onToggle = (s: CourseWithdrawalSettingsInfoDto) => {
    if (s.enabled) {
      setToggleOffTarget(s);
      return;
    }
    applyToggle(s);
  };

  const handleConfirmToggleOff = async () => {
    if (!toggleOffTarget) return;
    await applyToggle(toggleOffTarget);
    setToggleOffTarget(null);
  };

  const handleAddSection = async () => {
    const idText = newSectionIdInput.trim();
    if (!idText) return;

    if (!/^\d+$/.test(idText)) {
      enqueueSnackbar(
        f({ id: "adminDashboard.sectionTable.sectionIdInvalid" }),
        { variant: "error" },
      );
      return;
    }

    const sectionId = Number(idText);
    if (sections.some((s) => s.sectionId === sectionId)) {
      enqueueSnackbar(
        f({ id: "adminDashboard.sectionTable.sectionAlreadyAdded" }),
        { variant: "error" },
      );
      return;
    }

    const reference = sections[0];
    if (!reference) {
      enqueueSnackbar(
        f({ id: "adminDashboard.sectionTable.noReferenceSettings" }),
        { variant: "error" },
      );
      return;
    }

    try {
      const detail = await getSectionSettings(courseId, reference.sectionId);
      if (!detail.startAt || !detail.endAt) {
        enqueueSnackbar(
          f({ id: "adminDashboard.sectionTable.noReferenceSettings" }),
          { variant: "error" },
        );
        return;
      }

      await createSectionSettings(courseId, sectionId, {
        startAt: detail.startAt,
        endAt: detail.endAt,
        reviewDeadline: detail.reviewDeadline ?? undefined,
        noticeDelta: detail.noticeDelta ?? undefined,
        enabled: true,
      });
      setNewSectionIdInput("");
      await fetchSections();
    } catch {
      enqueueSnackbar(
        f({ id: "adminDashboard.sectionTable.addSectionFailed" }),
        {
          variant: "error",
        },
      );
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedSectionIds(
      checked ? new Set(sections.map((s) => s.sectionId)) : new Set(),
    );
  };

  const toggleSelectOne = (sectionId: number) => {
    setSelectedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const isAllSelected =
    sections.length > 0 && selectedSectionIds.size === sections.length;
  const isSomeSelected =
    selectedSectionIds.size > 0 && selectedSectionIds.size < sections.length;

  const [enabledSortOrder, setEnabledSortOrder] = useState<"asc" | "desc">(
    "asc",
  );
  const toggleEnabledSort = () => {
    setEnabledSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };
  const displaySections = [...sections].sort((a, b) => {
    const diff = Number(b.enabled) - Number(a.enabled);
    return enabledSortOrder === "asc" ? -diff : diff;
  });

  const course = sections[0];

  const skeletonRowsJSX = Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell padding="checkbox">
        <Skeleton variant="rounded" width={20} height={20} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="60%" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="80%" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="80%" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="80%" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="60%" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="80%" />
      </TableCell>
      <TableCell align="center">
        <Skeleton variant="text" width="40%" sx={{ mx: "auto" }} />
      </TableCell>
      <TableCell align="center">
        <Skeleton
          variant="rounded"
          width={34}
          height={20}
          sx={{ mx: "auto" }}
        />
      </TableCell>
      <TableCell align="center">
        <Skeleton
          variant="circular"
          width={24}
          height={24}
          sx={{ mx: "auto" }}
        />
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 0.5 }}>
        <Button sx={{ padding: "0" }} onClick={() => navigate("/admin")}>
          <Typography variant="body1" component="span">
            停修申請設定
          </Typography>
        </Button>
        <Typography variant="body1" component="span">
          /
        </Typography>
        <Typography variant="body1" component="span">
          班別設定
        </Typography>
      </Box>

      {isLoading ? (
        <Skeleton variant="text" width={240} sx={{ fontSize: "2rem", mb: 1 }} />
      ) : (
        <Typography variant="h1" sx={{ fontWeight: 400, mb: 2 }}>
          {course?.courseName ?? ""}
        </Typography>
      )}

      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "flex-start", mb: 5 }}
      >
        <TextField
          label={"搜尋班別"}
          value={newSectionIdInput}
          onChange={(e) => setNewSectionIdInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddSection();
          }}
          sx={{ width: 220 }}
        />
        <Divider orientation="vertical" flexItem sx={{ mt: 0.5 }} />
        <Button
          onClick={() => setIsBatchOpen(true)}
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          disabled={selectedSectionIds.size === 0}
          sx={{ mt: 0.5 }}
        >
          批次編輯設定
        </Button>
      </Stack>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderColor: "rgba(0,0,0,0.12)" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 500 }}>班別</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>申請開始時間</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>申請截止時間</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>教師審核期限</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>最後操作人</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>最後操作時間</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 80 }} align="center">
                申請數
              </TableCell>
              <TableCell sx={{ fontWeight: 500, width: 120 }} align="center">
                <TableSortLabel
                  active
                  direction={enabledSortOrder}
                  onClick={toggleEnabledSort}
                >
                  停修開關
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 500, width: 50 }} align="center">
                編輯
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? skeletonRowsJSX
              : displaySections.map((s) => (
                  <TableRow
                    key={s.sectionId}
                    hover
                    selected={selectedSectionIds.has(s.sectionId)}
                    sx={{
                      "&.Mui-selected": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.08),
                      },
                      "&.Mui-selected:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.12),
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={selectedSectionIds.has(s.sectionId)}
                        onChange={() => toggleSelectOne(s.sectionId)}
                      />
                    </TableCell>
                    <TableCell>
                      {getSectionName(s.sectionId) ?? s.sectionId}
                    </TableCell>
                    <TableCell>{formatDate(s.startAt ?? "")}</TableCell>
                    <TableCell>{formatDate(s.endAt ?? "")}</TableCell>
                    <TableCell>{formatDate(s.reviewDeadline ?? "")}</TableCell>
                    <TableCell>{s.updatedBy}</TableCell>
                    <TableCell>{formatDate(s.updatedAt)}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500 }}>
                      {s.withdrawalCount}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Switch
                          size="small"
                          checked={s.enabled}
                          onChange={() => onToggle(s)}
                        />
                        {s.enabled ? "開啟" : "關閉"}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => setEditingSectionId(s.sectionId)}
                        sx={{ color: "rgba(0,0,0,0.54)" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {!isLoading && sections.length === 0 && (
          <Box sx={{ py: 2, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              {f({ id: "adminDashboard.sectionTable.empty" })}
            </Typography>
          </Box>
        )}
      </TableContainer>

      <SectionSettingsEditDialog
        courseId={courseId}
        sectionId={editingSectionId}
        onClose={() => setEditingSectionId(null)}
        onSaved={fetchSections}
      />

      <BatchSettingsEditDialog
        open={isBatchOpen}
        courseId={courseId}
        sectionIds={Array.from(selectedSectionIds)}
        onClose={() => setIsBatchOpen(false)}
        onSaved={fetchSections}
      />

      <BaseDialog
        open={
          !!toggleOffTarget /* TODO: the logic should check withdrawal count */
        }
        size="xs"
        title={"即將關閉班別停修功能"}
        confirmBtnText={"確定"}
        cancelBtnText={"取消"}
        onConfirm={handleConfirmToggleOff}
        onCancel={() => setToggleOffTarget(null)}
      >
        <Typography variant="body1">
          欲關閉的班別已有停修申請，您確定要關閉？
        </Typography>
      </BaseDialog>
    </Box>
  );
};

export const CourseSectionSettingsTable = withSnackbar(
  CourseSectionSettingsTableContent,
);

export default CourseSectionSettingsTable;
