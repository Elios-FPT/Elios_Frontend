// Frontend/elios_FE/src/cvGenerator/components/EditorToolbar.js
import React, { useRef } from "react";
import { useDesignerState } from "../state/useDesignerState";
import { exportToPDF } from "../utils/exportToPDF"; // ✅ new import

const EditorToolbar = ({ stageRef }) => {
  const {
    addTextElement,
    addImageElement,
    updateElement,
    selectedElementId,
    removeElement,
    elements,
  } = useDesignerState();

  const fileInputRef = useRef();

  const selected = elements.find((el) => el.id === selectedElementId);

  const handleExportPDF = async () => {
    // If you're using a Konva stage:
    if (stageRef && stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
      await exportToPDF(dataURL, "My_CV.pdf", true);
    } else {
      // Or fallback to capturing an element by ID
      await exportToPDF("cv-editor", "My_CV.pdf");
    }
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <button onClick={addTextElement}>Add Text</button>
      <button onClick={() => fileInputRef.current.click()}>Upload Image</button>
      <input
        type="file"
        ref={fileInputRef}
        hidden
        onChange={(e) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = () => addImageElement(reader.result);
          reader.readAsDataURL(file);
        }}
      />
      {selected && (
        <>
          <button
            onClick={() => {
              const color = prompt("Enter color (e.g. #ff0000):");
              if (color) updateElement(selected.id, { fill: color });
            }}
          >
            Change Color
          </button>


          <button onClick={() => removeElement(selected.id)}>Delete</button>
        </>
      )}
      {/* <button onClick={handleExportPDF}>Export PDF</button> */}
    </div>
  );
};

export default EditorToolbar;
