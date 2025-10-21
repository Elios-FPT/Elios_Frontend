// Frontend/elios_FE/src/cvGenerator/utils/alignmentHelpers.js

const SNAP_THRESHOLD = 5; // distance in px for snapping

function readBox(item) {
  // Accepts either a Konva node (with x(), y(), width(), height(), scaleX(), scaleY(), id)
  // or a plain object { x, y, width, height, id }
  if (!item) return { id: null, x: 0, y: 0, width: 0, height: 0 };

  const x = typeof item.x === "function" ? item.x() : (item.x ?? 0);
  const y = typeof item.y === "function" ? item.y() : (item.y ?? 0);

  let width = typeof item.width === "function" ? item.width() : (item.width ?? 0);
  let height = typeof item.height === "function" ? item.height() : (item.height ?? 0);

  const scaleX = typeof item.scaleX === "function" ? item.scaleX() : (item.scaleX ?? 1);
  const scaleY = typeof item.scaleY === "function" ? item.scaleY() : (item.scaleY ?? 1);

  width = Number(width) * (Number(scaleX) || 1);
  height = Number(height) * (Number(scaleY) || 1);

  return {
    id: item.id ?? null,
    x: Number(x) || 0,
    y: Number(y) || 0,
    width: Number(width) || 0,
    height: Number(height) || 0,
  };
}

export function getSnapLines(elements, movingEl, pageWidth, pageHeight) {
  const lines = [];
  const snap = { x: null, y: null };

  if (!Array.isArray(elements)) return { lines, snap };

  // movingEl can be Konva node or a plain object
  const moving = readBox(movingEl);
  moving.centerX = moving.x + moving.width / 2;
  moving.centerY = moving.y + moving.height / 2;
  moving.left = moving.x;
  moving.right = moving.x + moving.width;
  moving.top = moving.y;
  moving.bottom = moving.y + moving.height;

  // Canvas center
  const canvasCenter = { x: pageWidth / 2, y: pageHeight / 2 };

  // Snap to page center (vertical / horizontal)
  if (Math.abs(moving.centerX - canvasCenter.x) < SNAP_THRESHOLD) {
    lines.push({ type: "v", x: canvasCenter.x });
    snap.x = canvasCenter.x - moving.width / 2;
  }

  if (Math.abs(moving.centerY - canvasCenter.y) < SNAP_THRESHOLD) {
    lines.push({ type: "h", y: canvasCenter.y });
    snap.y = canvasCenter.y - moving.height / 2;
  }

  // Compare with other elements (elements items may be Konva nodes or plain objects)
  elements.forEach((el) => {
    const target = readBox(el);
    if (!target.id || target.id === moving.id) return;

    // vertical: center
    if (Math.abs(moving.centerX - (target.x + target.width / 2)) < SNAP_THRESHOLD) {
      const vx = target.x + target.width / 2;
      lines.push({ type: "v", x: vx });
      snap.x = vx - moving.width / 2;
    }

    // vertical: left edges
    if (Math.abs(moving.left - target.x) < SNAP_THRESHOLD) {
      lines.push({ type: "v", x: target.x });
      snap.x = target.x;
    }

    // vertical: right edges
    if (Math.abs(moving.right - (target.x + target.width)) < SNAP_THRESHOLD) {
      const rightX = target.x + target.width;
      lines.push({ type: "v", x: rightX });
      snap.x = rightX - moving.width;
    }

    // horizontal: center
    if (Math.abs(moving.centerY - (target.y + target.height / 2)) < SNAP_THRESHOLD) {
      const hy = target.y + target.height / 2;
      lines.push({ type: "h", y: hy });
      snap.y = hy - moving.height / 2;
    }

    // horizontal: top
    if (Math.abs(moving.top - target.y) < SNAP_THRESHOLD) {
      lines.push({ type: "h", y: target.y });
      snap.y = target.y;
    }

    // horizontal: bottom
    if (Math.abs(moving.bottom - (target.y + target.height)) < SNAP_THRESHOLD) {
      const bottomY = target.y + target.height;
      lines.push({ type: "h", y: bottomY });
      snap.y = bottomY - moving.height;
    }
  });

  return { lines, snap };
}
