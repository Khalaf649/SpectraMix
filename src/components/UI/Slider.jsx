import React, { useRef, useEffect, useState, useCallback } from "react";

function Slider({
  value,
  onChange,
  className = "",
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
}) {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Helper: Calculate percentage position (0-100%) for CSS based on current value
  // logic: ((current - min) / range) * 100
  const getPercentage = useCallback(
    (val) => {
      return ((val - min) / (max - min)) * 100;
    },
    [min, max]
  );

  // 1. Calculate the value based on pointer position
  const calculateValue = useCallback(
    (clientX) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const { left, width } = rect;

      // 1. Calculate position (0 to 1) relative to track width
      let percentage = (clientX - left) / width;

      // Clamp between 0 and 1 (to stay within track bounds)
      percentage = Math.max(0, Math.min(1, percentage));

      // 2. Convert to value within range (min to max)
      const range = max - min;
      const rawValue = percentage * range + min;

      // 3. Snap to step
      const steppedValue = Math.round(rawValue / step) * step;

      // 4. Clamp final value to min/max safety check
      return Math.max(min, Math.min(max, steppedValue));
    },
    [max, min, step]
  );

  // 2. Handle Pointer Down
  const handlePointerDown = (e) => {
    if (disabled) return;

    // Prevent text selection
    e.preventDefault();
    setIsDragging(true);

    const newValue = calculateValue(e.clientX);
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  // 3. Global Listeners
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      const newValue = calculateValue(e.clientX);
      if (newValue !== value) {
        onChange(newValue);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, calculateValue, onChange, value]);

  const percentagePosition = getPercentage(value);

  return (
    <div
      ref={sliderRef}
      className={`slider-root ${disabled ? "disabled" : ""} ${className}`}
      onPointerDown={handlePointerDown}
    >
      <div className="slider-track">
        <div
          className="slider-range"
          style={{ width: `${percentagePosition}%` }}
        ></div>
      </div>

      <div
        className="slider-thumb"
        style={{
          left: `${percentagePosition}%`,
          // Inline styles for critical positioning logic
          position: "absolute",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
        tabIndex={0} // Make accessible/focusable
      />
    </div>
  );
}

export default Slider;
