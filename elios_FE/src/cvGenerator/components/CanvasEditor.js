// Frontend/elios_FE/src/cvGenerator/components/CanvasEditor.js
import React, { useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Text, Rect } from "react-konva";
import CanvasImage from "./UrlImage";
import { useDesignerState } from "../state/useDesignerState";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

const CanvasEditor = () => {
  const {
    pages,
    addPage,
    selectElement,
    updateElement,
    addImageElement,
    selectedElementId,
    copyElement,
    pasteElement,
    duplicateElement,
    currentPageId,
    setCurrentPage,
  } = useDesignerState();

  const stageRefs = useRef({}); // store refs for each page

  useEffect(() => {
    window.stageRefs = stageRefs.current;
  }, []);

  // ✅ Handle drag-drop, paste, and shortcuts (same as before)
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files && files[0] && files[0].type.startsWith("image/")) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = () => addImageElement(reader.result);
        reader.readAsDataURL(file);
      }
    },
    [addImageElement]
  );

  const handlePasteImage = useCallback(
    (e) => {
      const items = e.clipboardData?.items || [];
      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = () => addImageElement(reader.result);
          reader.readAsDataURL(blob);
        }
      }
    },
    [addImageElement]
  );

  // improved keyboard shortcuts: supports mac/win, ignores when typing in inputs,
  // allows Paste (Ctrl/Cmd+V) even if nothing is selected (for cross-page paste)
  const handleKeyDown = useCallback(
    (e) => {
      const isMod = e.ctrlKey || e.metaKey; // ctrl on win, cmd on mac
      if (!isMod) return;

      // don't intercept shortcuts while editing a form input / contenteditable
      const active = document.activeElement;
      const tag = active?.tagName;
      const isEditing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        active?.isContentEditable;

      if (isEditing) return;

      const key = e.key?.toLowerCase();

      // Copy (needs selection)
      if (key === "c") {
        if (!selectedElementId) return;
        e.preventDefault();
        copyElement(selectedElementId);
        return;
      }

      // Paste (do NOT require selection) — paste into current page
      if (key === "v") {
        e.preventDefault();
        pasteElement();
        return;
      }

      // Duplicate (needs selection)
      if (key === "d") {
        if (!selectedElementId) return;
        e.preventDefault();
        duplicateElement(selectedElementId);
        return;
      }
    },
    [selectedElementId, copyElement, pasteElement, duplicateElement]
  );

  useEffect(() => {
    const container = document.getElementById("cv-canvas-container");
    if (!container) return;

    container.addEventListener("drop", handleDrop);
    container.addEventListener("dragover", (e) => e.preventDefault());

    window.addEventListener("paste", handlePasteImage);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("drop", handleDrop);
      window.removeEventListener("paste", handlePasteImage);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleDrop, handlePasteImage, handleKeyDown]);


  useEffect(() => {
    const container = document.getElementById("cv-canvas-container");
    if (!container) return;

    container.addEventListener("drop", handleDrop);
    container.addEventListener("dragover", (e) => e.preventDefault());
    window.addEventListener("paste", handlePasteImage);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("drop", handleDrop);
      window.removeEventListener("paste", handlePasteImage);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleDrop, handlePasteImage, handleKeyDown]);

  // ✅ Render all pages stacked vertically
  return (
    <div className="canvas-editor-wrapper">
      <div id="cv-canvas-container" className="canvas-editor">
        {pages.map((page, i) => (
          <div
            key={page.id}
            style={{
              marginBottom: "40px", // spacing between pages
              border:
                page.id === currentPageId
                  ? "3px solid #4A90E2"
                  : "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              background: "#fff",
              width: PAGE_WIDTH / 1.5,
              height: PAGE_HEIGHT / 1.5,
              overflow: "hidden",
            }}
            // onClick={() => setCurrentPage(page.id)}
          >
           <Stage
  ref={(ref) => (stageRefs.current[page.id] = ref)}
  width={PAGE_WIDTH / 1.5}
  height={PAGE_HEIGHT / 1.5}
  onMouseDown={(e) => {
    const clickedOnEmpty = e.target === e.target.getStage();

    // Always switch to this page
    // Keep selection if user clicked on a shape
    setCurrentPage(page.id, !clickedOnEmpty);

    // If user clicked background → clear selection manually
    if (clickedOnEmpty) {
      selectElement(null);
    }
  }}
>

              <Layer>
                {page.elements.map((el) =>
                  el.type === "text" ? (
                    <Text
                      id={el.id}
                      key={el.id}
                      text={el.text}
                      x={el.x}
                      y={el.y}
                      fontSize={el.fontSize}
                      fill={el.color}
                      fontFamily={el.fontFamily}
                      draggable
                      onClick={() => selectElement(el.id)}
                      onDragEnd={(e) =>
                        updateElement(el.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        })
                      }
                    />
                  ) : el.type === "image" ? (
                    <CanvasImage
                      id={el.id}
                      key={el.id}
                      src={el.src}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      draggable
                      onClick={() => selectElement(el.id)}
                      onDragEnd={(e) =>
                        updateElement(el.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        })
                      }
                    />
                  ) : null
                )}
              </Layer>
            </Stage>
          </div>
        ))}
      </div>

      {/* 🧭 Add page button */}
      <div className="page-controls" style={{ marginTop: "20px" }}>
        <button onClick={addPage}>➕ Add another page</button>
      </div>
    </div>
  );
};

export default CanvasEditor;
