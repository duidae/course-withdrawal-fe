import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  type TableCellProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";

export type Directory<T, K> = T & {
  files: K[];
};

export type DataManagementColumn<T, K> = {
  key: string;
  label: string;
  style?: React.CSSProperties;
  align?: TableCellProps["align"];
  renderDirectoryCell?: (
    directory: Directory<T, K>,
    isExpanded: boolean,
    toggleExpand: (directory: T) => void,
  ) => React.ReactNode;
  renderFileCell?: (file: K) => React.ReactNode;
};

export type DataManagementListProps<
  T extends { id: string | number | null },
  K extends { id: string | number | null },
> = {
  expandAllDirectory: boolean;
  directories: Array<Directory<T, K>>;
  columns: DataManagementColumn<T, K>[];
  noFileComponent?: React.ReactNode;
  headerStyle?: React.CSSProperties;
  sx?: React.CSSProperties;
};

export const StyledTableCell = styled(TableCell)(() => ({
  padding: 0,
}));

export const StyledTableRow = styled(TableRow)(() => ({
  padding: 0,
}));

function getDirectoryKey(directoryId: string | number | null): string {
  return directoryId === null ? "null" : String(directoryId);
}

/**
 * 【DataManagementList 資料管理列表】
 *
 * DataManagementList 是用來顯示資料夾與檔案的列表。
 *
 * 使用這個元件最大的前提是，傳入 directories 必須是「資料夾」＋「多個檔案」的複合結構陣列，並且每個資料夾/檔案都必須有 id。
 * （**注意：每個資料夾的深度僅能有一層，深層的檔案結構無法使用這個元件來呈現**。)
 *
 * 其中，可以用 columns 用於定義每個欄位的樣式與內容，包含：
 * - key: 欄位的 key
 * - label: 欄位的標題（即表頭）
 * - style: 欄位的樣式
 * - align: 欄位的對齊方式
 * - renderDirectoryCell: 資料夾層級的渲染方法。（有額外提供可選的參數： isExpanded 與 toggleExpand 參數，可用來判斷是否展開，以及切換展開狀態）
 * - renderFileCell: 資料夾層級的渲染方法
 *
 * @prop {boolean} expandAllDirectory - 是否展開所有資料夾
 * @prop {Array<Directory<T, K>>} directories - 資料夾與檔案的複合結構陣列
 * @prop {Array<DataManagementColumn<T, K>>} columns - 各欄位的定義
 * @prop {React.ReactNode} noFileComponent - 沒有檔案時的顯示元件
 * @prop {React.CSSProperties} headerStyle - 表頭樣式
 * @prop {React.CSSProperties} sx - 主列表樣式
 *
 * @coolUI
 */
export function DataManagementList<
  T extends { id: string | number | null },
  K extends { id: string | number | null },
>(props: DataManagementListProps<T, K>) {
  const {
    expandAllDirectory,
    directories,
    noFileComponent,
    columns,
    headerStyle,
    sx,
  } = props;

  const [expandedDirectories, setExpandedDirectories] = useState<Set<string>>(
    new Set(),
  );

  const toggleExpand = (directory: T) => {
    const key = getDirectoryKey(directory.id);
    setExpandedDirectories((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        ...sx,
      }}
    >
      <Table>
        {/* Header Row */}
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                style={{
                  ...headerStyle,
                }}
                align={col.align || "left"}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {/* Directory rows */}
          {directories.map((directory) => {
            const directoryKey = getDirectoryKey(directory.id);
            const isExpanded =
              expandedDirectories.has(directoryKey) || expandAllDirectory;

            return (
              <React.Fragment key={`directory-fragment-${directoryKey}`}>
                <StyledTableRow
                  sx={{ backgroundColor: "grey.100" }}
                  key={`directory-${directory.id}`}
                >
                  {columns.map((col) => {
                    return (
                      <StyledTableCell
                        key={`directory-${directory.id}-${col.key}`}
                        style={{ ...col.style }}
                        align={col.align || "left"}
                      >
                        {col.renderDirectoryCell
                          ? col.renderDirectoryCell(
                              directory,
                              isExpanded,
                              toggleExpand,
                            )
                          : null}
                      </StyledTableCell>
                    );
                  })}
                </StyledTableRow>

                {/* File rows */}
                {isExpanded &&
                  renderFileRows(directory, columns, noFileComponent)}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function renderFileRows<
  T extends { id: string | number | null },
  K extends { id: string | number | null },
>(
  directory: Directory<T, K>,
  columns: DataManagementColumn<T, K>[],
  noFileComponent?: React.ReactNode,
) {
  // Render no file component if there is no file
  if (directory.files.length === 0) {
    return (
      <StyledTableRow key={`empty-${directory.id}`}>
        <StyledTableCell />
        <StyledTableCell colSpan={columns.length - 1}>
          {noFileComponent}
        </StyledTableCell>
      </StyledTableRow>
    );
  }

  return directory.files.map((file, idx) => (
    <StyledTableRow key={`file-${directory.id}-${file.id}-${idx}`}>
      {columns.map((col) => {
        return (
          <StyledTableCell
            key={`file-${directory.id}-${file.id}-${col.key}`}
            style={{ ...col.style }}
            align={col.align || "left"}
          >
            {col.renderFileCell?.(file) ?? null}
          </StyledTableCell>
        );
      })}
    </StyledTableRow>
  ));
}
