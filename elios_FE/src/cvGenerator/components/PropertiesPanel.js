// elios_FE/src/cvGenerator/components/PropertiesPanel.js
import React, { useState, useEffect } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { useDesignerState } from "../state/useDesignerState";
import { FONT_LIST } from "../utils/fonts";
import "../styles/PropertiesPanel.css";

const PropertiesPanel = () => {
  const {
    pages,
    currentPageId,
    updateElement,
    selectedElementId,
  } = useDesignerState();

  // 🧩 find the current page safely
  const currentPage = pages?.find((p) => p.id === currentPageId);
  const elements = currentPage?.elements || [];

  // ✅ avoid crash even if nothing selected
  const selected = elements.find((el) => el.id === selectedElementId);

  const [pendingFont, setPendingFont] = useState(selected?.fontFamily || "");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (selected) setPendingFont(selected.fontFamily || "");
  }, [selected]);

  useEffect(() => {
    if (!selected || !pendingFont) return;
    if (selected.fontFamily === pendingFont) return;

    let cancelled = false;
    const node = window.stage?.findOne(`#${selected.id}`);

    const applyFont = async () => {
      try {
        if (!(await document.fonts.check(`16px "${pendingFont}"`))) {
          await document.fonts.load(`16px "${pendingFont}"`);
          await document.fonts.ready;
        }

        if (cancelled) return;

        updateElement(selected.id, { fontFamily: pendingFont });
        if (node) {
          node.fontFamily(pendingFont);
          node.getLayer()?.batchDraw();
        }
      } catch (err) {
        console.warn("Font load failed:", pendingFont, err);
      }
    };

    applyFont();
    return () => {
      cancelled = true;
    };
  }, [pendingFont, selected?.id]);

  if (!selected)
    return <div className="properties-empty">No element selected</div>;

  const filteredFonts = FONT_LIST.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="properties-panel">
      <h5 className="panel-title">Properties</h5>

      {selected.type === "text" && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Text</Form.Label>
            <Form.Control
              type="text"
              value={selected.text}
              onChange={(e) =>
                updateElement(selected.id, { text: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Font Size: {selected.fontSize}px</Form.Label>
            <Form.Range
              min={10}
              max={80}
              value={selected.fontSize}
              onChange={(e) =>
                updateElement(selected.id, { fontSize: +e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Color</Form.Label>
            <InputGroup>
              <Form.Control
                type="color"
                value={selected.color}
                onChange={(e) =>
                  updateElement(selected.id, { color: e.target.value })
                }
              />
              <Form.Control
                type="text"
                value={selected.color}
                readOnly
                className="color-code-display"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Font Family</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search font..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: "6px" }}
            />
            <Form.Select
              value={pendingFont}
              onChange={(e) => setPendingFont(e.target.value)}
            >
              {filteredFonts.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </>
      )}

      {selected.type === "image" && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Image Width</Form.Label>
            <Form.Control
              type="number"
              min={50}
              max={1000}
              value={selected.width}
              onChange={(e) =>
                updateElement(selected.id, { width: +e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Image Height</Form.Label>
            <Form.Control
              type="number"
              min={50}
              max={1000}
              value={selected.height}
              onChange={(e) =>
                updateElement(selected.id, { height: +e.target.value })
              }
            />
          </Form.Group>
        </>
      )}
    </div>
  );
};

export default PropertiesPanel;
