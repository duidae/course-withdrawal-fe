import { useState } from "react";
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
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

// Brand accent used only where MUI's default theme primary shouldn't apply.
// If your ThemeProvider's palette.primary.main is already this color, you
// can drop every `color="brand"` / sx override below and just use
// color="primary" throughout.
const brand = "#0099CC";

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
}) => {
  const cErr = cSearch.length > 50 ? "字數上限為 50 字" : "";
  const filteredCourse = courses.filter(
    (c) =>
      c.semester === semester &&
      (!cSearch.trim() ||
        c.courseName.toLowerCase().includes(cSearch.toLowerCase())),
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 400, color: "#333", mb: 3 }}>
        停修申請設定
      </Typography>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="semester-label">學期</InputLabel>
            <Select
              labelId="semester-label"
              label="學期"
              value={semester}
              onChange={(event) => setSemester(event.target.value)}
            >
              <MenuItem value="114-2 (2026 Spring)">
                114-2 (2026 Spring)
              </MenuItem>
              <MenuItem value="114-1 (2025 Fall)">114-1 (2025 Fall)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="課程名稱"
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
          startIcon={<AddIcon />}
          sx={{
            color: brand,
            borderColor: "rgba(0,153,204,0.5)",
            "&:hover": { borderColor: brand },
          }}
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
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: 500, width: 165 }}>學期</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 88 }}>課程 ID</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>課程名稱</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 80 }} align="center">
                申請數
              </TableCell>
              <TableCell sx={{ width: 100 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCourse.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>{c.semester}</TableCell>
                <TableCell>{c.courseId}</TableCell>
                <TableCell>{c.courseName}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 500 }}>
                  {(appCounts && appCounts[c.id]) || 0}
                </TableCell>
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Tooltip title="編輯">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(c)}
                        sx={{ color: "rgba(0,0,0,0.54)" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Switch
                      size="small"
                      checked={c.vis !== false}
                      onChange={() => onToggle(c)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: brand,
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: brand,
                          },
                      }}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!cErr && filteredCourse.length === 0 && (
          <Box sx={{ py: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              找不到符合搜尋條件的課程
            </Typography>
          </Box>
        )}
      </TableContainer>
    </Box>
  );
};

export default AdminDashboard;
