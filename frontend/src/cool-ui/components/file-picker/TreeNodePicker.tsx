import { useState, type FC, type ReactNode } from "react";

import {
  CheckBox,
  CheckBoxOutlineBlank,
  IndeterminateCheckBox,
  ExpandMore,
  ExpandLess,
  RadioButtonUnchecked,
  RadioButtonChecked,
} from "@mui/icons-material";

import "react-checkbox-tree/lib/react-checkbox-tree.css";
import "./TreeNodePicker.scss";
// @ts-expect-error - no type declarations for this JS module
import PatchedCheckboxTree from "./PatchedCheckboxTree.jsx";

export type Node = {
  value: string;
  label: ReactNode;
  children?: Node[];
  showCheckbox?: boolean;
  disabled?: boolean;
};

type TreeNodePickerProps = {
  rootNodes: Node[];
  canvasFileIds: number[];
  allowMultiple: boolean;
  onCheck: (checkedValues: string[]) => void;
};

/**
 * 【TreeNodePicker】 樹狀節點選擇器
 *
 * 此元件會以樹狀的層級結構呈現節點，並且使用者可以透過勾選節點進行選擇。
 *
 * @coolUI
 * @prop {Node[]} rootNodes - 節點資料
 * @prop {number[]} canvasFileIds - 已勾選的節點值
 * @prop {boolean} allowMultiple - 啟用複選
 * @prop {(checkedValues: string[]) => void} onCheck - 勾選節點被觸發的 function
 *
 **/

export const TreeNodePicker: FC<TreeNodePickerProps> = (
  props: TreeNodePickerProps,
) => {
  const {
    rootNodes,
    onCheck: handleCheck,
    canvasFileIds,
    allowMultiple,
  } = props;

  const initCheckedNodes = canvasFileIds.map((id) => `file${id.toString()}`);
  const [checkedNodes, setCheckedNodes] = useState<string[]>(initCheckedNodes);
  const [expandedNodes, setExpandedNodes] = useState<string[]>(["root"]);

  return (
    <PatchedCheckboxTree
      nodes={rootNodes}
      expanded={expandedNodes}
      checked={checkedNodes}
      onCheck={(checkedValues: string[]) => {
        setCheckedNodes(checkedValues);
        handleCheck(checkedValues);
      }}
      onExpand={(expandedValue: string[]) => setExpandedNodes(expandedValue)}
      icons={{
        check: allowMultiple ? (
          <CheckBox color="primary" />
        ) : (
          <RadioButtonChecked color="primary" />
        ),
        uncheck: allowMultiple ? (
          <CheckBoxOutlineBlank color="action" />
        ) : (
          <RadioButtonUnchecked color="action" />
        ),
        halfCheck: <IndeterminateCheckBox color="primary" />,
        expandClose: <ExpandMore color="action" className="expand-icon" />,
        expandOpen: <ExpandLess color="action" className="expand-icon" />,
        parentClose: null,
        parentOpen: null,
        leaf: null,
      }}
      onlyLeafCheckboxes={!allowMultiple}
    />
  );
};
