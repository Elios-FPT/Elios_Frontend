// Frontend/elios_FE/src/cvGenerator/components/CanvasEditor.js
import React from "react";
import { Stage, Layer, Text } from "react-konva";
import CanvasImage from "./UrlImage";
import { useDesignerState } from "../state/useDesignerState";

const CanvasEditor = () => {
  // 👇 add updateElement here
  const { elements, selectElement, updateElement } = useDesignerState();

  return (
    <div className="canvas-editor">
      <Stage width={800} height={1100}>
        <Layer>
          {elements.map((el) =>
            el.type === "text" ? (
              <Text
                key={el.id}
                text={el.text}
                x={el.x}
                y={el.y}
                fontSize={el.fontSize}
                fill={el.color}
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
