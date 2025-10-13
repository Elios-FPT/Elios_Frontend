// Frontend/elios_FE/src/cvGenerator/components/CanvasEditor.js
import React, { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Text, Rect, Transformer, Line } from "react-konva";
import CanvasImage from "./UrlImage";
import { useDesignerState } from "../state/useDesignerState";
import { getSnapLines } from "../utils/alignmentHelpers";

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

  const [guideLines, setGuideLines] = useState([]);

  const stageRefs = useRef({}); // store refs for each page
  const transformerRef = useRef();


  useEffect(() => {
    window.stageRefs = stageRefs.current;
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRefs.current[currentPageId];// use first stage (or active one)
    if (!transformer || !stage) return;

    const selectedNode = stage.findOne(`#${selectedElementId}`);
    if (selectedNode) {
      transformer.nodes([selectedNode]);
      transformer.getLayer().batchDraw();
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedElementId, pages]);


  // ✅ Handle drag-drop, paste, and shortcuts
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

  const handleKeyDown = useCallback(
    (e) => {
      const isMod = e.ctrlKey || e.metaKey; // ctrl on win, cmd on mac
      if (!isMod) return;

      const active = document.activeElement;
      const tag = active?.tagName;
      const isEditing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        active?.isContentEditable;

      if (isEditing) return;

      const key = e.key?.toLowerCase();

      if (key === "c") {
        if (!selectedElementId) return;
        e.preventDefault();
        copyElement(selectedElementId);
        return;
      }

      if (key === "v") {
        e.preventDefault();
        pasteElement();
        return;
      }

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

  // ✅ Render all pages stacked vertically
  return (
    <div className="canvas-editor-wrapper">
      <div id="cv-canvas-container" className="canvas-editor">
        {pages.map((page, i) => {
          // find selected element on this page
          const selectedElement = page.elements.find(
            (el) => el.id === selectedElementId
          );

          return (
            <div
              key={page.id}
              style={{
                marginBottom: "40px",
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
            >
              <Stage
                ref={(ref) => (stageRefs.current[page.id] = ref)}
                width={PAGE_WIDTH / 1.5}
                height={PAGE_HEIGHT / 1.5}
                onMouseDown={(e) => {
                  const clickedOnEmpty = e.target === e.target.getStage();
                  setCurrentPage(page.id, !clickedOnEmpty);
                  if (clickedOnEmpty) selectElement(null);
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
                        onClick={(e) => {
                          const node = e.target;
                          // 🔹 Get the actual width and height from the rendered text
                          updateElement(el.id, {
                            width: node.width(),
                            height: node.height(),
                          });
                          selectElement(el.id);
                        }}
                        onDragMove={(e) => {
                          const node = e.target;
                          const scaledW = PAGE_WIDTH / 1.5;
                          const scaledH = PAGE_HEIGHT / 1.5;

                          // Build list of other nodes (prefer real Konva node if available)
                          const otherNodes = page.elements
                            .filter((o) => o.id !== el.id)
                            .map((o) => {
                              const stage = stageRefs.current[page.id];
                              const n = stage?.findOne(`#${o.id}`);
                              // If Konva node exists, pass it directly; otherwise pass a plain object with numeric props
                              if (n) return n;
                              return { id: o.id, x: o.x, y: o.y, width: o.width, height: o.height, scaleX: 1, scaleY: 1 };
                            });

                          const { lines, snap } = getSnapLines(otherNodes, node, scaledW, scaledH);

                          setGuideLines(lines);

                          // only apply numeric snaps
                          if (snap && typeof snap.x === "number" && !Number.isNaN(snap.x)) {
                            node.x(snap.x);
                          }
                          if (snap && typeof snap.y === "number" && !Number.isNaN(snap.y)) {
                            node.y(snap.y);
                          }

                          // force layer redraw so lines show immediately
                          node.getLayer()?.batchDraw();
                        }}


                        onDragEnd={(e) => {
                          const node = e.target;
                          updateElement(el.id, {
                            x: node.x(),
                            y: node.y(),
                            width: node.width(),
                            height: node.height(),
                          });
                          setGuideLines([]); // clear after drag ends
                        }}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const scaleY = node.scaleY();

                          // Get the current font size from the node
                          const newFontSize = node.fontSize() * scaleY;

                          // Reset scale so it doesn't visually distort
                          node.scaleX(1);
                          node.scaleY(1);

                          // Update font size and position only
                          updateElement(el.id, {
                            x: node.x(),
                            y: node.y(),
                            fontSize: Math.max(6, newFontSize), // keep readable min font
                          });
                        }}
                        onMouseEnter={(e) => {
                          const node = e.target;
                          updateElement(el.id, {
                            width: node.width(),
                            height: node.height(),
                          });
                        }}
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
                        onDragMove={(e) => {
                          const node = e.target;
                          const scaledW = PAGE_WIDTH / 1.5;
                          const scaledH = PAGE_HEIGHT / 1.5;

                          // Build list of other nodes (prefer real Konva node if available)
                          const otherNodes = page.elements
                            .filter((o) => o.id !== el.id)
                            .map((o) => {
                              const stage = stageRefs.current[page.id];
                              const n = stage?.findOne(`#${o.id}`);
                              // If Konva node exists, pass it directly; otherwise pass a plain object with numeric props
                              if (n) return n;
                              return { id: o.id, x: o.x, y: o.y, width: o.width, height: o.height, scaleX: 1, scaleY: 1 };
                            });

                          const { lines, snap } = getSnapLines(otherNodes, node, scaledW, scaledH);

                          setGuideLines(lines);

                          // only apply numeric snaps
                          if (snap && typeof snap.x === "number" && !Number.isNaN(snap.x)) {
                            node.x(snap.x);
                          }
                          if (snap && typeof snap.y === "number" && !Number.isNaN(snap.y)) {
                            node.y(snap.y);
                          }

                          // force layer redraw so lines show immediately
                          node.getLayer()?.batchDraw();
                        }}


                        onDragEnd={(e) => {
                          updateElement(el.id, {
                            x: e.target.x(),
                            y: e.target.y(),
                          });
                          setGuideLines([]);
                        }}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          updateElement(el.id, {
                            x: node.x(),
                            y: node.y(),
                            width: node.width() * node.scaleX(),
                            height: node.height() * node.scaleY(),
                          });
                          node.scaleX(1);
                          node.scaleY(1);
                        }}
                      />
                    ) : null
                  )}

                  {/* ➖ Guide lines during drag */}
                  {guideLines.map((line, idx) =>
                    line.type === "v" ? (
                      <Line
                        key={`v-${idx}`}
                        points={[line.x, 0, line.x, PAGE_HEIGHT / 1.5]}
                        stroke="#FF3366"
                        strokeWidth={1}
                        dash={[6, 4]}
                        listening={false}
                      />
                    ) : (
                      <Line
                        key={`h-${idx}`}
                        points={[0, line.y, PAGE_WIDTH / 1.5, line.y]}
                        stroke="#FF3366"
                        strokeWidth={1}
                        dash={[6, 4]}
                        listening={false}
                      />
                    )
                  )}


                  {/* 🔳 Broken dashed border around selected element */}
                  {selectedElement && (
                    <Rect
                      x={(selectedElement.x ?? 0) - 2}
                      y={(selectedElement.y ?? 0) - 2}
                      width={(selectedElement.width ?? 0) + 4}
                      height={(selectedElement.height ?? 0) + 4}
                      stroke="#4A90E2"
                      strokeWidth={1}
                      dash={[6, 4]}
                      listening={false}
                    />
                  )}

                  {selectedElement && (
                    <Transformer
                      ref={transformerRef}
                      rotateEnabled={false} // disable rotation if you want
                      boundBoxFunc={(oldBox, newBox) => {
                        // Limit minimal size
                        if (newBox.width < 20 || newBox.height < 10) {
                          return oldBox;
                        }
                        return newBox;
                      }}
                    />
                  )}

                </Layer>
              </Stage>
            </div>
          );
        })}
      </div>

      {/* 🧭 Add page button */}
      <div className="page-controls" style={{ marginTop: "20px" }}>
        <button onClick={addPage}>➕ Add another page</button>
      </div>
    </div>
  );
};

export default CanvasEditor;
