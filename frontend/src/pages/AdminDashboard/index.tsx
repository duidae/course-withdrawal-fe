import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { useSnackbar } from "notistack";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Skeleton from "@mui/material/Skeleton";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { withSnackbar } from "../../cool-ui/components/alert/SnackbarAlert";
import {
  getCourseSettings,
  createCourseSettings,
  updateCourseSettings,
  getSectionCatalog,
} from "../../apis/course-withdrawal.api.mock";
import { type CourseWithdrawalSettingsInfoDto } from "../../models";
import { BaseDialog } from "../../cool-ui/components/dialogs/BaseDialog";
import {
  AddCourseSettingsDialog,
  type BatchAddCourseWithdrawalSettingsInput,
} from "./AddCourseSettingsDialog";

const AdminDashboardContent = () => {
  const { formatMessage: f } = useIntl();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const allSemesterOption = "全部";

  const [courses, setCourses] = useState<CourseWithdrawalSettingsInfoDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [semester, setSemester] = useState(allSemesterOption);
  const [cSearch, setCSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toggleOffTarget, setToggleOffTarget] =
    useState<CourseWithdrawalSettingsInfoDto | null>(null);

  const fetchCourseSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getCourseSettings(0);
      setCourses(data);
    } catch {
      enqueueSnackbar(f({ id: "adminDashboard.error.fetchFailed" }), {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseSettings();
  }, []);

  const onAdd = () => {
    setIsAddOpen(true);
  };

  const onAddConfirm = async (input: BatchAddCourseWithdrawalSettingsInput) => {
    try {
      await Promise.all(
        input.courses.flatMap((course) =>
          getSectionCatalog().map((section) =>
            createCourseSettings(course.courseId, {
              sectionId: section.id,
              startAt: input.startAt,
              endAt: input.endAt,
              reviewDeadline: input.reviewDeadline,
              noticeDelta: input.noticeDelta,
              enabled: true,
            }),
          ),
        ),
      );
      setIsAddOpen(false);
      await fetchCourseSettings();
    } catch {
      enqueueSnackbar(f({ id: "adminDashboard.error.createFailed" }), {
        variant: "error",
      });
    }
  };

  const onEdit = (c: CourseWithdrawalSettingsInfoDto) => {
    navigate(`/admin/courses/${c.courseId}`);
  };

  const applyToggle = async (c: CourseWithdrawalSettingsInfoDto) => {
    try {
      await updateCourseSettings(c.courseId, {
        sectionId: c.sectionId,
        enabled: !c.enabled,
      });
      setCourses((prev) =>
        prev.map((course) =>
          course.courseId === c.courseId && course.sectionId === c.sectionId
            ? { ...course, enabled: !course.enabled }
            : course,
        ),
      );
      enqueueSnackbar(`已成功${!c.enabled ? "開啟" : "關閉"}課程停修功能`, {
        variant: "success",
      });
    } catch {
      enqueueSnackbar(`${!c.enabled ? "開啟" : "關閉"}課程停修功能失敗`, {
        variant: "error",
      });
    }
  };

  const onToggle = (c: CourseWithdrawalSettingsInfoDto) => {
    if (c.enabled) {
      setToggleOffTarget(c);
      return;
    }
    applyToggle(c);
  };

  const handleConfirmToggleOff = async () => {
    if (!toggleOffTarget) return;
    await applyToggle(toggleOffTarget);
    setToggleOffTarget(null);
  };

  const cErr =
    cSearch.length > 50
      ? f({ id: "adminDashboard.filter.courseNameTooLong" })
      : "";
  const semesterOptions = [
    allSemesterOption,
    ...Array.from(new Set(courses.map((c) => c.term))).filter(Boolean),
  ];
  const filteredCourse = courses.filter(
    (c) =>
      (semester === allSemesterOption || c.term === semester) &&
      (!cSearch.trim() ||
        c.courseName.toLowerCase().includes(cSearch.toLowerCase())),
  );

  const skeletonRowsJSX = Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton variant="text" width="80%" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="80%" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="60%" />
      </TableCell>
      <TableCell align="center">
        <Skeleton variant="text" width="40%" sx={{ mx: "auto" }} />
      </TableCell>
      <TableCell>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", justifyContent: "center" }}
        >
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="rounded" width={34} height={20} />
        </Stack>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <Typography variant="h1" sx={{ fontWeight: 400, color: "#333", mb: 4 }}>
        停修申請設定
      </Typography>

      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="semester-label">選擇學期</InputLabel>
            <Select
              labelId="semester-label"
              label={"選擇學期"}
              value={semester}
              onChange={(event) => setSemester(event.target.value)}
            >
              {semesterOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label={"課程名稱"}
            value={cSearch}
            onChange={(ev) => setCSearch(ev.target.value)}
            error={!!cErr}
            helperText={cErr || " "}
            sx={{ width: 300 }}
          />
        </Stack>

        <Button
          onClick={onAdd}
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
        >
          新增課程
        </Button>
      </Stack>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderColor: "rgba(0,0,0,0.12)" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5", height: "38px" }}>
              <TableCell sx={{ padding: "8px", fontWeight: 500, width: 170 }}>
                學期
              </TableCell>
              <TableCell sx={{ padding: "8px", fontWeight: 500, width: 100 }}>
                課程 ID
              </TableCell>
              <TableCell sx={{ padding: "8px", fontWeight: 500 }}>
                課程名稱
              </TableCell>
              <TableCell
                sx={{ padding: "8px", fontWeight: 500, width: 60 }}
                align="center"
              >
                申請數
              </TableCell>
              <TableCell sx={{ padding: "8px", width: 145 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? skeletonRowsJSX
              : filteredCourse.map((c) => (
                  <TableRow key={`${c.courseId}-${c.sectionId}`} hover>
                    <TableCell sx={{ padding: "8px" }}>{c.term}</TableCell>
                    <TableCell sx={{ padding: "8px" }}>{c.courseId}</TableCell>
                    <TableCell sx={{ padding: "8px" }}>
                      {c.courseName}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ padding: "8px", fontWeight: 500 }}
                    >
                      {c.withdrawalCount}
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center", justifyContent: "center" }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => onEdit(c)}
                          sx={{ color: "rgba(0,0,0,0.54)" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <Switch
                          size="small"
                          checked={c.enabled}
                          onChange={() => onToggle(c)}
                        />
                        {c.enabled ? "開啟" : "關閉"}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {!isLoading && !cErr && filteredCourse.length === 0 && (
          <Box sx={{ py: 2, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              {f({ id: "adminDashboard.table.emptyFiltered" })}
            </Typography>
          </Box>
        )}
      </TableContainer>

      <AddCourseSettingsDialog
        open={isAddOpen}
        existingCourseIds={Array.from(new Set(courses.map((c) => c.courseId)))}
        onConfirm={onAddConfirm}
        onCancel={() => setIsAddOpen(false)}
      />

      <BaseDialog
        open={
          !!toggleOffTarget /* TODO: the logic should check withdrawal count */
        }
        size="xs"
        title={"即將關閉課程停修功能"}
        confirmBtnText={"確定"}
        cancelBtnText={"取消"}
        onConfirm={handleConfirmToggleOff}
        onCancel={() => setToggleOffTarget(null)}
      >
        <Typography variant="body1">
          您即將關閉此課程的停修申請功能。您確定要繼續嗎？
        </Typography>
      </BaseDialog>
    </Box>
  );
};

export const AdminDashboard = withSnackbar(AdminDashboardContent);

export default AdminDashboard;
