import { useEffect, useRef, forwardRef, type RefObject } from "react";
import { Typography } from "@mui/material";
import Quill from "quill";
import katex from "katex";
import hljs from "highlight.js";

import "katex/dist/katex.min.css";
import "quill/dist/quill.snow.css";
import "highlight.js/styles/github-dark.css";

export interface QuillEditorProps {
  defaultContent?: string;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  error?: boolean;
  height?: number | string;
  toolbarOptions?: any;
  onBlur?: () => void;
  onFocus?: () => void;
  onImagePaste?: (
    contents: any,
    delta: any,
    source: string,
    editor: Quill,
  ) => void;
  onTextChange?: (
    contents: any,
    delta: any,
    source: string,
    editor: Quill,
  ) => void;
  onSelectionChange?: (range: any, oldRange: any, source: string) => void;
}

// QuillEditor toolbar options
export type ToolbarOption = string[] | { [key: string]: any }[];
const defaultToolbarOptions: ToolbarOption[] = [
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  ["link"],
];
const ERROR_CLASS = "error";

// To render formula, katex needs to be assigned to window, and type "katex" should be declared in global.
// ref: https://github.com/slab/quill/issues/2554#issuecomment-913149261
declare global {
  interface Window {
    katex: any;
  }
}
window.katex = katex;

// quill creates relative links by default if scheme is missing, which will cause the link to be broken.
// ref: https://github.com/slab/quill/issues/3188#issuecomment-703060216
const LinkBlot = Quill.import("formats/link") as any;
class CustomLinkBlot extends LinkBlot {
  static create(value: any) {
    const node = super.create(value);
    if (!value.startsWith("http")) {
      node.setAttribute("href", `http://${value}`);
    }
    return node;
  }
}

CustomLinkBlot.blotName = "link";
CustomLinkBlot.tagName = "a";

Quill.register(CustomLinkBlot);

// Add customized attributes to img element
// ref: https://stackoverflow.com/questions/51125342/implement-custom-editor-for-quill-blot
const ImageBlot = Quill.import("formats/image") as any;
class CustomImageBlot extends ImageBlot {
  static create(value: any) {
    let node = super.create(value.src);
    if (value.uploaded !== undefined) {
      node.setAttribute("uploaded", value.uploaded);
    }
    return node;
  }

  static value(node: HTMLElement) {
    return {
      src: node.getAttribute("src"),
      uploaded: node.getAttribute("uploaded") || "false",
    };
  }
}

CustomImageBlot.blotName = "customImage";
CustomImageBlot.tagName = "img";

Quill.register(CustomImageBlot);

/**
 * QuillEditor 文字編輯器
 *
 * @param defaultContent
 * @param placeholder
 * @param helperText
 * @param height 編輯區域高度，超出時可垂直滾動；預設為自動依內容延伸
 * @param toolbarOptions 預設為 defaultToolbarContainer
 * @param disabled 禁用時，輸入框會無法編輯。工具列上的按鈕會沒有反應。
 * @param error
 * @param onBlur
 * @param onFocus
 * @param onImagePaste
 * @param onTextChange
 * @param onSelectionChange
 */
export const QuillEditor = forwardRef<Quill, QuillEditorProps>(
  (
    {
      defaultContent,
      placeholder,
      helperText,
      height,
      toolbarOptions = defaultToolbarOptions,
      disabled,
      error,
      onBlur: handleBlur,
      onFocus: handleFocus,
      onImagePaste: handleImagePaste,
      onTextChange: handleTextChange,
      onSelectionChange: handleSelectionChange,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Initialize Quill editor
    // Do NOT add deps, re-creating Quill will break editor state.
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div"),
      );

      // Add container to "bounds" to prevent tooltip cut off by the edge
      // ref: https://github.com/slab/quill/issues/360#issuecomment-810425327)
      const editor = new Quill(editorContainer, {
        theme: "snow",
        placeholder: disabled ? "" : placeholder,
        modules: {
          toolbar: toolbarOptions,
          syntax: { hljs },
          clipboard: true,
        },

        bounds: container,
      });

      if (height !== undefined) {
        editor.root.style.height =
          typeof height === "number" ? `${height}px` : height;
        editor.root.style.overflowY = "auto";
      }

      // Customize tooltip placeholder
      // ref: https://github.com/zenoamaro/react-quill/issues/546
      try {
        const input = (editor.theme as any).tooltip.root.querySelector(
          "input[data-link]",
        );
        input.dataset.link = "www.example.com";
        input.dataset.video = "video link";
        input.dataset.formula = "E=mc^2";
      } catch (error) {
        console.error("Failed to customize tooltip placeholders:", error);
      }

      // Set default content
      if (defaultContent) {
        const delta = editor.clipboard.convert({ html: defaultContent });
        editor.setContents(delta);
      }

      // Quill only refreshes the "ql-blank" class (which shows the CSS
      // placeholder) on TEXT_CHANGE. For CJK input methods, that event only
      // fires once composition is confirmed (e.g. pressing Enter), so the
      // placeholder stays visually overlapping the in-progress composition
      // until then. Hide it as soon as composition starts.
      const handleCompositionStart = () => {
        editor.root.classList.remove("ql-blank");
      };
      editor.root.addEventListener("compositionstart", handleCompositionStart);

      if (!ref) return;
      (ref as RefObject<Quill | null>).current = editor;

      return () => {
        if (ref) (ref as RefObject<Quill | null>).current = null;
        editor.root.removeEventListener(
          "compositionstart",
          handleCompositionStart,
        );
        container.innerHTML = "";
      };
    }, []);
    /* eslint-disable react-hooks/exhaustive-deps */

    useEffect(() => {
      const editor = (ref as RefObject<Quill | null>).current;
      if (!editor) return;

      const handleTextChangeWrapper = (
        delta: any,
        oldContent: any,
        source: any,
      ) => {
        handleImagePaste?.(oldContent, delta, source, editor);
        handleTextChange?.(oldContent, delta, source, editor);
      };

      const handleSelectionChangeWrapper = (
        range: any,
        oldRange: any,
        source: any,
      ) => {
        handleSelectionChange?.(range, oldRange, source);
      };

      const handleBlurWrapper = () => {
        handleBlur?.();
      };

      const handleFocusWrapper = () => {
        handleFocus?.();
      };

      editor.on(Quill.events.TEXT_CHANGE, handleTextChangeWrapper);
      editor.on(Quill.events.SELECTION_CHANGE, handleSelectionChangeWrapper);
      editor.root.addEventListener("blur", handleBlurWrapper);
      editor.root.addEventListener("focus", handleFocusWrapper);

      return () => {
        editor.off(Quill.events.TEXT_CHANGE, handleTextChangeWrapper);
        editor.off(Quill.events.SELECTION_CHANGE, handleSelectionChangeWrapper);
        editor.root.removeEventListener("blur", handleBlurWrapper);
        editor.root.removeEventListener("focus", handleFocusWrapper);
      };
    }, [
      handleImagePaste,
      handleTextChange,
      handleSelectionChange,
      handleBlur,
      handleFocus,
    ]);

    // Disable handling
    useEffect(() => {
      const editor = (ref as RefObject<Quill | null>)?.current;
      if (!editor) return;

      editor.enable(!disabled);
    }, [disabled]);

    // Error handling
    useEffect(() => {
      const editor = (ref as RefObject<Quill | null>)?.current;
      if (!editor) return;

      const qlContainer = editor.container;
      const toolbar = editor.getModule("toolbar") as any;
      const qlToolbar = toolbar.container as HTMLElement;

      qlContainer.classList.toggle(ERROR_CLASS, error);
      qlToolbar.classList.toggle(ERROR_CLASS, error);
    }, [error]);

    return (
      <>
        <div ref={containerRef} className="quill" />
        <Typography variant="body2" color={error ? "error" : "inherit"}>
          {helperText}
        </Typography>
      </>
    );
  },
);
