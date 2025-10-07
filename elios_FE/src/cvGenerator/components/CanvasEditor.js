// Frontend/elios_FE/src/cvGenerator/components/CanvasEditor.js
import React, { useRef, useEffect } from "react";
import { Stage, Layer, Text } from "react-konva";
import CanvasImage from "./UrlImage";
import { useDesignerState } from "../state/useDesignerState";

const CanvasEditor = () => {
  const { elements, selectElement, updateElement } = useDesignerState();
  const stageRef = useRef();

  useEffect(() => {
    window.stage = stageRef.current; // ✅ Makes it accessible globally
  }, []);

  
  return (
    <div className="canvas-editor">
      <Stage width={600} height={750}>
        <Layer>
          {elements.map((el) =>
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
  );
};

export default CanvasEditor;
