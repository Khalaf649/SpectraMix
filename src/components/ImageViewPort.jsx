import {
  grayscaleToImageData,
  applyBrightnessContrast,
  normalizeForDisplay,
} from "../utils/imageProcessing";
import { useRef, useState, useEffect, useCallback } from "react";
import SelectBox from "./UI/SelectBox";

function ImageViewPort({
  id,
  title,
  grayscale,
  ftMagnitude,
  ftPhase,
  ftReal,
  ftImaginary,
  width,
  height,
  paddedWidth,
  paddedHeight,
  onImageLoad,
  regionSettings,
  setRegionSettings,
  showRegion = false,
  isOutput = false,
  isSelected = false,
  onSelect,
}) {
  const imageCanvasRef = useRef(null);
  const ftCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [ftComponent, setFtComponent] = useState("FT Magnitude");

  // Brightness/Contrast State
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [ftBrightness, setFtBrightness] = useState(0);
  const [ftContrast, setFtContrast] = useState(0);

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [isFtDragging, setIsFtDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // ---------------------------------------------------------
  // 1. Render Spatial Domain Canvas
  // ---------------------------------------------------------
  useEffect(() => {
    if (!imageCanvasRef.current || !grayscale || width === 0 || height === 0)
      return;

    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    const normalized = normalizeForDisplay(grayscale, false);
    const adjusted = applyBrightnessContrast(normalized, brightness, contrast);
    const imgData = grayscaleToImageData(adjusted, width, height);
    ctx.putImageData(imgData, 0, 0);
  }, [grayscale, width, height, brightness, contrast]);

  // ---------------------------------------------------------
  // 2. Render Frequency Domain Canvas + Region Overlay
  // ---------------------------------------------------------
  useEffect(() => {
    if (!ftCanvasRef.current || paddedWidth === 0 || paddedHeight === 0) return;

    let data = null;
    let useLog = true;
    switch (ftComponent) {
      case "FT Magnitude":
        data = ftMagnitude;
        break;
      case "FT Phase":
        data = ftPhase;
        useLog = false;
        break;
      case "FT Real":
        data = ftReal;
        useLog = false;
        break;
      case "FT Imaginary":
        data = ftImaginary;
        useLog = false;
        break;
      default:
        break;
    }

    if (!data) return;

    const canvas = ftCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = paddedWidth;
    canvas.height = paddedHeight;

    const normalized = normalizeForDisplay(data, useLog);
    const adjusted = applyBrightnessContrast(
      normalized,
      ftBrightness,
      ftContrast
    );
    const imgDataObj = grayscaleToImageData(
      adjusted,
      paddedWidth,
      paddedHeight
    );
    ctx.putImageData(imgDataObj, 0, 0);

    // Draw Region Overlay
    if (showRegion && regionSettings) {
      let { startX, startY, endX, endY, isInner } = regionSettings;

      // Handle initialization if state is empty
      if (endX <= startX || endY <= startY) {
        const defW = Math.floor(paddedWidth * 0.4);
        const defH = Math.floor(paddedHeight * 0.4);
        startX = Math.floor((paddedWidth - defW) / 2);
        startY = Math.floor((paddedHeight - defH) / 2);
        endX = startX + defW;
        endY = startY + defH;
      }

      const rw = endX - startX;
      const rh = endY - startY;

      // Fill Overlay
      ctx.fillStyle = isInner
        ? "rgba(0, 200, 255, 0.25)"
        : "rgba(255, 100, 200, 0.25)";
      if (isInner) {
        ctx.fillRect(startX, startY, rw, rh);
      } else {
        // High-pass visualization (shade the corners/outside)
        ctx.beginPath();
        ctx.rect(0, 0, paddedWidth, paddedHeight);
        ctx.rect(startX, startY, rw, rh);
        ctx.fill("evenodd");
      }

      // Border
      ctx.strokeStyle = isInner ? "#00c8ff" : "#ff64c8";
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, rw, rh);

      // Handles
      const hSize = 10;
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      // Top-Left Handle
      ctx.fillRect(startX - hSize / 2, startY - hSize / 2, hSize, hSize);
      ctx.strokeRect(startX - hSize / 2, startY - hSize / 2, hSize, hSize);
      // Bottom-Right Handle
      ctx.fillRect(endX - hSize / 2, endY - hSize / 2, hSize, hSize);
      ctx.strokeRect(endX - hSize / 2, endY - hSize / 2, hSize, hSize);
    }
  }, [
    ftComponent,
    ftMagnitude,
    ftPhase,
    ftReal,
    ftImaginary,
    paddedWidth,
    paddedHeight,
    ftBrightness,
    ftContrast,
    showRegion,
    regionSettings,
  ]);

  // ---------------------------------------------------------
  // 3. Pointer Handlers (Frequency Domain)
  // ---------------------------------------------------------
  const handleFtPointerDown = (e) => {
    if (showRegion && regionSettings && ftCanvasRef.current) {
      const rect = ftCanvasRef.current.getBoundingClientRect();
      const scaleX = paddedWidth / rect.width;
      const scaleY = paddedHeight / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const { startX: sx, startY: sy, endX: ex, endY: ey } = regionSettings;
      const handleTolerance = 15;

      let mode = null;
      if (
        Math.abs(x - sx) < handleTolerance &&
        Math.abs(y - sy) < handleTolerance
      ) {
        mode = "resize-tl";
      } else if (
        Math.abs(x - ex) < handleTolerance &&
        Math.abs(y - ey) < handleTolerance
      ) {
        mode = "resize-br";
      } else if (x >= sx && x <= ex && y >= sy && y <= ey) {
        mode = "move";
      }

      if (mode) {
        e.preventDefault();
        ftCanvasRef.current.setPointerCapture(e.pointerId);
        ftCanvasRef.current.__dragMode = mode;
        ftCanvasRef.current.__dragStart = { x, y };
        return;
      }
    }

    // Fallback: Brightness/Contrast
    setIsFtDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleFtPointerMove = (e) => {
    const canvas = ftCanvasRef.current;
    if (showRegion && canvas?.__dragMode && canvas.__dragStart) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = paddedWidth / rect.width;
      const scaleY = paddedHeight / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const dx = x - canvas.__dragStart.x;
      const dy = y - canvas.__dragStart.y;
      const minSize = 10;

      setRegionSettings((prev) => {
        let { startX, startY, endX, endY } = prev;
        if (canvas.__dragMode === "move") {
          const w = endX - startX;
          const h = endY - startY;
          startX = Math.max(0, Math.min(paddedWidth - w, startX + dx));
          startY = Math.max(0, Math.min(paddedHeight - h, startY + dy));
          endX = startX + w;
          endY = startY + h;
        } else if (canvas.__dragMode === "resize-tl") {
          startX = Math.max(0, Math.min(endX - minSize, startX + dx));
          startY = Math.max(0, Math.min(endY - minSize, startY + dy));
        } else if (canvas.__dragMode === "resize-br") {
          endX = Math.min(paddedWidth, Math.max(startX + minSize, endX + dx));
          endY = Math.min(paddedHeight, Math.max(startY + minSize, endY + dy));
        }
        return { ...prev, startX, startY, endX, endY };
      });

      canvas.__dragStart = { x, y };
      return;
    }

    if (!isFtDragging) return;
    const dxp = e.clientX - dragStart.x;
    const dyp = e.clientY - dragStart.y;
    setFtContrast((prev) => Math.max(-100, Math.min(100, prev + dxp * 0.5)));
    setFtBrightness((prev) => Math.max(-100, Math.min(100, prev - dyp * 0.5)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleFtPointerUp = (e) => {
    const canvas = ftCanvasRef.current;
    if (canvas?.__dragMode) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
      canvas.__dragMode = null;
      canvas.__dragStart = null;
    }
    setIsFtDragging(false);
  };

  // ---------------------------------------------------------
  // 4. Mouse Handlers (Spatial Domain)
  // ---------------------------------------------------------
  const handleImageMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleImageMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setContrast((prev) => Math.max(-100, Math.min(100, prev + dx * 0.5)));
    setBrightness((prev) => Math.max(-100, Math.min(100, prev - dy * 0.5)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleImageMouseUp = () => setIsDragging(false);

  // ---------------------------------------------------------
  // 5. General Helpers
  // ---------------------------------------------------------
  const handleDoubleClick = () => {
    if (!isOutput) fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageLoad) onImageLoad(id, file);
    e.target.value = "";
  };

  const hasImage = grayscale !== null;
  const canvasStyle = width > 0 ? { width: "100%", height: "auto" } : undefined;

  return (
    <div
      onClick={() => isOutput && onSelect?.(id)}
      className={`viewport viewport-container ${
        isOutput ? "cursor-pointer" : ""
      } 
        ${isOutput && isSelected ? "output-viewport-selected" : ""}`}
    >
      <div
        className={`viewport-header ${
          isOutput && isSelected ? "output-viewport-header" : ""
        }`}
      >
        <span className="text-sm font-medium text-foreground flex items-center gap-2">
          {title}{" "}
          {isOutput && isSelected && (
            <span className="active-badge">Active</span>
          )}
        </span>
        <span className="data-label">
          {width > 0 ? `${width}×${height}` : "No image"}
        </span>
      </div>

      <div className="viewport-body">
        {/* Spatial Canvas */}
        <div
          className="viewport-canvas-area"
          onDoubleClick={handleDoubleClick}
          onMouseDown={handleImageMouseDown}
          onMouseMove={handleImageMouseMove}
          onMouseUp={handleImageMouseUp}
          onMouseLeave={handleImageMouseUp}
        >
          {hasImage ? (
            <canvas
              ref={imageCanvasRef}
              className="max-w-full max-h-full object-contain"
              style={canvasStyle}
            />
          ) : (
            <div className="viewport-empty-text">
              <p
                className={
                  isOutput ? "text-signal-magenta" : "text-signal-cyan"
                }
              >
                {isOutput
                  ? "Output will appear here"
                  : "Double-click to load image"}
              </p>
            </div>
          )}
          {hasImage && (
            <div className="viewport-bc-overlay">
              B:{brightness.toFixed(0)} C:{contrast.toFixed(0)}
            </div>
          )}
        </div>

        {/* Frequency Canvas */}
        <div className="viewport-ft-section">
          <div className="viewport-ft-header">
            <SelectBox
              value={ftComponent}
              onChange={setFtComponent}
              options={["FT Magnitude", "FT Phase", "FT Real", "FT Imaginary"]}
              className="select-trigger-ft"
            />
          </div>

          <div
            className="viewport-canvas-area"
            style={{ touchAction: "none" }} // Prevents scrolling while dragging on touch
            onPointerDown={handleFtPointerDown}
            onPointerMove={handleFtPointerMove}
            onPointerUp={handleFtPointerUp}
            onPointerLeave={handleFtPointerUp}
          >
            {ftMagnitude ? (
              <canvas
                ref={ftCanvasRef}
                className="max-w-full max-h-full object-contain"
                style={canvasStyle}
              />
            ) : (
              <div className="viewport-empty-text-sm">
                {isOutput ? "Mix images to see FT" : "Load image to see FT"}
              </div>
            )}
            {ftMagnitude && (
              <div className="viewport-bc-overlay">
                B:{ftBrightness.toFixed(0)} C:{ftContrast.toFixed(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {!isOutput && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="input-hidden"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
}

export default ImageViewPort;
