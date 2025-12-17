// src/classes/Image.js

import {
  normalizeForDisplay,
  applyBrightnessContrast,
  grayscaleToImageData,
} from "../utils/imageProcessing"; // Will stay only on client

/**
 * Image class - Symmetric between Client (JS) and Server (Python)
 * Represents one image slot (input or output)
 * Holds grayscale, FFT components, dimensions, and client-only UI state
 */
export class Image {
  constructor(id, isOutput = false) {
    this.id = id; // Unique ID: 0-3 input, 4-5 output
    this.isOutput = isOutput;

    // === Core data - synced with server ===
    this.width = 0;
    this.height = 0;
    this.paddedWidth = 0;
    this.paddedHeight = 0;

    this.grayscale = null; // Float64Array | null

    this.magnitude = null; // Float64Array | null
    this.phase = null;
    this.real = null;
    this.imaginary = null;

    this.isLoaded = false; // FFT computed and valid
    this.isProcessing = false;

    // === Client-only UI state (ignored on server) ===
    this.ftView = "magnitude"; // "magnitude" | "phase" | "real" | "imaginary"
    this.brightness = 0; // -100 to 100
    this.contrast = 0;
    this.ftBrightness = 0;
    this.ftContrast = 0;
  }

  // ==================== GETTERS ====================

  getCurrentFTData() {
    switch (this.ftView) {
      case "magnitude":
        return this.magnitude;
      case "phase":
        return this.phase;
      case "real":
        return this.real;
      case "imaginary":
        return this.imaginary;
      default:
        return this.magnitude;
    }
  }

  getUseLogScale() {
    return this.ftView === "magnitude";
  }

  hasGrayscale() {
    return this.grayscale !== null;
  }

  hasFT() {
    return this.isLoaded && this.magnitude !== null;
  }

  isInput() {
    return !this.isOutput;
  }

  // ==================== SETTERS ====================

  setDimensions(width, height, paddedWidth, paddedHeight) {
    this.width = width;
    this.height = height;
    this.paddedWidth = paddedWidth;
    this.paddedHeight = paddedHeight;
  }

  setGrayscale(grayscaleArray) {
    this.grayscale = new Float64Array(grayscaleArray);
  }

  setFFT({ magnitude, phase, real, imaginary, paddedWidth, paddedHeight }) {
    this.magnitude = new Float64Array(magnitude);
    this.phase = new Float64Array(phase);
    this.real = new Float64Array(real);
    this.imaginary = new Float64Array(imaginary);
    this.paddedWidth = paddedWidth;
    this.paddedHeight = paddedHeight;

    this.isLoaded = true;
    this.isProcessing = false;
  }

  setProcessing(processing = true) {
    this.isProcessing = processing;
  }

  // UI setters (client only)
  setFtView(view) {
    if (["magnitude", "phase", "real", "imaginary"].includes(view)) {
      this.ftView = view;
    }
  }

  setBrightness(value) {
    this.brightness = Math.max(-100, Math.min(100, Number(value) || 0));
  }

  setContrast(value) {
    this.contrast = Math.max(-100, Math.min(100, Number(value) || 0));
  }

  setFtBrightness(value) {
    this.ftBrightness = Math.max(-100, Math.min(100, Number(value) || 0));
  }

  setFtContrast(value) {
    this.ftContrast = Math.max(-100, Math.min(100, Number(value) || 0));
  }

  // ==================== UTILITY METHODS (Client-only rendering) ====================

  /**
   * Returns ImageData for spatial domain (grayscale or output)
   */
  getSpatialImageData() {
    if (!this.grayscale) return null;

    const normalized = normalizeForDisplay(this.grayscale, false);
    const adjusted = applyBrightnessContrast(
      normalized,
      this.brightness,
      this.contrast
    );
    return grayscaleToImageData(adjusted, this.width, this.height);
  }

  /**
   * Returns ImageData for current FT view
   */
  getFTImageData() {
    if (!this.hasFT()) return null;

    const data = this.getCurrentFTData();
    const useLog = this.getUseLogScale();

    const normalized = normalizeForDisplay(data, useLog);
    const adjusted = applyBrightnessContrast(
      normalized,
      this.ftBrightness,
      this.ftContrast
    );
    return grayscaleToImageData(adjusted, this.paddedWidth, this.paddedHeight);
  }

  // ==================== RESET & CLEANUP ====================

  resetUI() {
    this.ftView = "magnitude";
    this.brightness = 0;
    this.contrast = 0;
    this.ftBrightness = 0;
    this.ftContrast = 0;
  }

  resetAll() {
    this.grayscale = null;
    this.magnitude = null;
    this.phase = null;
    this.real = null;
    this.imaginary = null;

    this.width = 0;
    this.height = 0;
    this.paddedWidth = 0;
    this.paddedHeight = 0;

    this.isLoaded = false;
    this.isProcessing = false;

    this.resetUI();
  }
}
