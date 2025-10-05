// Frontend/elios_FE/src/cvGenerator/components/PropertiesPanel.js
import React from "react";
import { useDesignerState } from "../state/useDesignerState";

const PropertiesPanel = () => {
  const { elements, selectedElementId, updateElement } = useDesignerState();
  const selected = elements.find((el) => el.id === selectedElementId);

  if (!selected) return <div>No element selected</div>;

  return (
    <div style={{ marginTop: "1rem" }}>
      <h4>Properties</h4>
      {selected.type === "text" && (
        <>
          <label>Font Size: </label>
          <input
            type="number"
            value={selected.fontSize}
            onChange={(e) =>
              updateElement(selected.id, { fontSize: +e.target.value })
            }
          />
          <br />
          <label>Text: </label>
          <input
            type="text"
            value={selected.text}
            onChange={(e) =>
              updateElement(selected.id, { text: e.target.value })
            }
          />
        </>
      )}
    </div>
  );
};

export default PropertiesPanel;
