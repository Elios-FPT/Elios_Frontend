// Frontend/elios_FE/src/cvGenerator/components/UrlImage.jsx
import React, { useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";

const CanvasImage = ({ src, ...props }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => setImage(img);
  }, [src]);

  return image ? <KonvaImage image={image} {...props} /> : null;
};

export default CanvasImage;
