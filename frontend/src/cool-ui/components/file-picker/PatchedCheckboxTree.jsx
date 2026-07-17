import CheckboxTree from "react-checkbox-tree";

class PatchedCheckboxTree extends CheckboxTree {
  // checkState:
  // 0 - not checked,
  // 1 - checked,
  // 2 - partial checked (State 'checked' is cascaded to some of its children)

  // Override the isEveryChildChecked method with custom implementation
  isEveryChildChecked(node) {
    const { model } = this.state;

    return node.children.every(
      // original code: (child) => model.getNode(child.value).checkState === 1,
      (child) => model.getNode(child.value).checkState === 1,
    );
  }

  // Override the isSomeChildChecked method with custom implementation
  isSomeChildChecked(node) {
    const { model } = this.state;

    return node.children.some(
      // original code: (child) => model.getNode(child.value).checkState > 0
      (child) =>
        !model.getNode(child.value).disabled &&
        model.getNode(child.value).checkState > 0,
    );
  }
}

export default PatchedCheckboxTree;
