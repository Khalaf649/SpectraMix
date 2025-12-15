import {
  grayscaleToImageData,
  applyBrightnessContrast,
  normalizeForDisplay,
} from "../utils/imageProcessing";
import { useRef, useState, useEffect } from "react";
import SelectBox from "./SelectBox";
function ImageViewPort({
  id,
  title,
  grayscale,
  outputImage,
  ftMagnitude,
  ftPhase,
  ftReal,
  ftImaginary,
  width,
  height,
  paddedWidth,
  paddedHeight,
  onImageLoad,
  regionPercentage = 50,
  regionType = "inner",
  showRegion = false,
  displaySize,
  isOutput = false,
  isSelected = false,
  onSelect,
}) {
  const displayWidth = displaySize?.width || width;
  const displayHeight = displaySize?.height || height;
  const imageCanvasRef = useRef(null);
  const ftCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [ftComponent, setFtComponent] = useState("magnitude");
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [ftBrightness, setFtBrightness] = useState(0);
  const [ftContrast, setFtContrast] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFtDragging, setIsFtDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // For output mode, use outputImage; for input mode, use grayscale
  const imageData = isOutput ? outputImage : grayscale;
  useEffect(() => {
    if (!imageCanvasRef.current || !imageData || width === 0 || height === 0)
      return;
    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    if (isOutput && outputImage) {
      // Normalize Float64Array for display
      let min = Infinity,
        max = -Infinity;
      for (let i = 0; i < outputImage.length; i++) {
        if (outputImage[i] < min) min = outputImage[i];
        if (outputImage[i] > max) max = outputImage[i];
      }
      const range = max - min || 1;
      const normalized = new Uint8ClampedArray(outputImage.length);
      for (let i = 0; i < outputImage.length; i++) {
        normalized[i] = ((outputImage[i] - min) / range) * 255;
      }
      const adjusted = applyBrightnessContrast(
        normalized,
        brightness,
        contrast
      );
      const imgData = grayscaleToImageData(adjusted, width, height);
      ctx.putImageData(imgData, 0, 0);
    } else if (grayscale) {
      const adjusted = applyBrightnessContrast(grayscale, brightness, contrast);
      const imgData = grayscaleToImageData(adjusted, width, height);
      ctx.putImageData(imgData, 0, 0);
    }
  }, [grayscale, outputImage, isOutput, width, height, brightness, contrast]);
  useEffect(() => {
    if (!ftCanvasRef.current || paddedWidth === 0 || paddedHeight === 0) return;
    let data = null;
    let useLog = true;
    switch (ftComponent) {
      case "magnitude":
        data = ftMagnitude;
        break;
      case "phase":
        data = ftPhase;
        useLog = false;
        break;
      case "real":
        data = ftReal;
        useLog = false;
        break;
      case "imaginary":
        data = ftImaginary;
        useLog = false;
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
    const imageData = grayscaleToImageData(adjusted, paddedWidth, paddedHeight);
    ctx.putImageData(imageData, 0, 0);

    if (showRegion && regionPercentage > 0) {
      const regionWidth = (paddedWidth * regionPercentage) / 100;
      const regionHeight = (paddedHeight * regionPercentage) / 100;
      const startX = (paddedWidth - regionWidth) / 2;
      const startY = (paddedHeight - regionHeight) / 2;
      ctx.fillStyle =
        regionType === "inner"
          ? "rgba(0, 200, 255, 0.3)"
          : "rgba(255, 100, 200, 0.3)";
      if (regionType === "inner") {
        ctx.fillRect(startX, startY, regionWidth, regionHeight);
      } else {
        ctx.fillRect(0, 0, paddedWidth, startY);
        ctx.fillRect(
          0,
          startY + regionHeight,
          paddedWidth,
          paddedHeight - startY - regionHeight
        );
        ctx.fillRect(0, startY, startX, regionHeight);
        ctx.fillRect(
          startX + regionWidth,
          startY,
          paddedWidth - startX - regionWidth,
          regionHeight
        );
      }
      ctx.strokeStyle =
        regionType === "inner" ? "hsl(190, 95%, 55%)" : "hsl(300, 80%, 60%)";
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, regionWidth, regionHeight);
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
    regionPercentage,
    regionType,
  ]);
  const handleDoubleClick = () => {
    if (!isOutput) fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageLoad) onImageLoad(id, file);
    e.target.value = "";
  };

  const handleClick = () => {
    if (isOutput && onSelect) onSelect(id);
  };

  const handleImageMouseDown = (e) => {
    // Implement drag to adjust brightness/contrast if needed
  };
  const handleImageMouseMove = (e) => {
    // Implement drag to adjust brightness/contrast if needed
  };
  const handleImageMouseUp = () => {};
  const handleFtMouseMove = (e) => {
    // Implement drag to adjust brightness/contrast if needed
  };
  const handleFtMouseUp = (e) => {};
  const handleFtMouseDown = (e) => {
    // Implement drag to adjust brightness/contrast if needed
  };

  const canvasStyle =
    displayWidth > 0
      ? { width: displayWidth, height: displayHeight }
      : undefined;
  const hasImage = isOutput ? outputImage !== null : grayscale !== null;
  const emptyText = isOutput
    ? "Output will appear here"
    : "Double-click to load image";
  const emptyTextClass = isOutput ? "text-signal-magenta" : "text-signal-cyan";
  return (
    <div
      onClick={handleClick}
      className={`viewport animate-fade-in viewport-container ${
        isOutput ? "cursor-pointer" : ""
      } ${isOutput && isSelected ? "output-viewport-selected" : ""}`}
    >
      <div
        className={`viewport-header ${
          isOutput && isSelected ? "output-viewport-header" : ""
        }`}
      >
        <span className="text-sm font-medium text-foreground flex items-center gap-2">
          {title}
          {isOutput && isSelected && (
            <span className="active-badge">Active</span>
          )}
        </span>
        <span className="data-label">
          {displayWidth > 0
            ? `${displayWidth}×${displayHeight}`
            : isOutput
            ? "No output"
            : "No image"}
        </span>
      </div>
      <div className="viewport-body">
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
              <p className={emptyTextClass}>{emptyText}</p>
            </div>
          )}
          {hasImage && (
            <div className="viewport-bc-overlay">
              B:{brightness.toFixed(0)} C:{contrast.toFixed(0)}
            </div>
          )}
        </div>
        <div className="viewport-ft-section">
          <div className="viewport-ft-header">
            <SelectBox
              value={ftComponent}
              onChange={setFtComponent}
              options={["FT Magnitude", "FT Phase", "FT Real", "FT Imaginary"]}
            />
          </div>

          <div
            className="viewport-canvas-area"
            onMouseDown={handleFtMouseDown}
            onMouseMove={handleFtMouseMove}
            onMouseUp={handleFtMouseUp}
            onMouseLeave={handleFtMouseUp}
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
