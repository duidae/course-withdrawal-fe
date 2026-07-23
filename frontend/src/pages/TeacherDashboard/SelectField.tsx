import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { type FilterSelectProps } from "./types";

export const SelectField = ({
  label,
  value,
  onChange,
  options,
  width,
  disabled,
}: FilterSelectProps) => {
  const labelId = `select-field-${label}`;
  return (
    <FormControl size="small" style={{ width }} disabled={disabled}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={value}
        onChange={(e: SelectChangeEvent) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
