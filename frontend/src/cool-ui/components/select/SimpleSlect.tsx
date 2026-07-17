import { useRef, useState, useEffect, type FC } from "react";
import {
  FormHelperText,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
} from "@mui/material";

export type SelectOption = {
  label: string;
  value: string;
};

type SimpleSelectProps = {
  value: string;
  options: SelectOption[];
  label?: string;
  helperText?: string;
  maxShowingItems?: number;
  disabled?: boolean;
  error?: boolean;
  onChange: (event: SelectChangeEvent<string>) => void;
};

const ITEM_HEIGHT = 36;
const ITEM_PADDING_TOP = 8;

/**
 * 【SimpleSelect 單選式下拉選單（純選擇）】
 *
 * @coolUI
 * @prop {string} value - 所選取的值。
 * @prop {SelectOption[]} options - 下拉選單選項。
 * @prop {string} label - 下拉選單標籤。
 * @prop {string} helperText - 下拉選單輔助文字。
 * @prop {boolean} disabled - 是否禁用下拉選單。
 * @prop {boolean} error - 是否顯示錯誤狀態。
 * @prop {number} maxShowingItems - 最大顯示選項數量。
 * @prop {(event: SelectChangeEvent<string>) => void} onChange - 當選取值改變時的 callback。
 */
export const SimpleSelect: FC<SimpleSelectProps> = (
  props: SimpleSelectProps,
) => {
  const {
    value,
    options,
    label,
    helperText,
    disabled,
    error,
    maxShowingItems = 5,
    onChange,
  } = props;

  const selectRef = useRef<HTMLDivElement>(null);
  const [menuWidth, setMenuWidth] = useState<number>(0);

  // Resize the menu width when the window size changes
  useEffect(() => {
    const handleResize = () => {
      if (selectRef.current) {
        setMenuWidth(selectRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Clean up the event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * maxShowingItems + ITEM_PADDING_TOP,
        width: menuWidth,
        minWidth: menuWidth,
      },
    },
  };

  return (
    <FormControl fullWidth error={error} disabled={disabled}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        label={label}
        value={value}
        onChange={onChange}
        size="small"
        MenuProps={MenuProps}
        ref={selectRef}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            <Typography noWrap>{opt.label}</Typography>
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
