import {
  fft2d,
  fftShift,
  computeMagnitude,
  computePhase,
  nextPowerOf2,
} from "./fft";

export function convertToGrayscale(imageData) {
  const data = imageData.data;
  const grayscale = new Uint8ClampedArray(imageData.width * imageData.height);

  for (let i = 0; i < data.length; i += 4) {
    // Luminance formula
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    grayscale[i / 4] = gray;
  }

  return grayscale;
}

export function resizeImage(canvas, targetWidth, targetHeight) {
  const resizedCanvas = document.createElement("canvas");
  resizedCanvas.width = targetWidth;
  resizedCanvas.height = targetHeight;

  const ctx = resizedCanvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

  return resizedCanvas;
}

export function applyBrightnessContrast(data, brightness, contrast) {
  const result = new Uint8ClampedArray(data.length);
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i++) {
    let value = data[i];
    value = factor * (value - 128) + 128 + brightness;
    result[i] = Math.max(0, Math.min(255, value));
  }

  return result;
}

export function grayscaleToImageData(grayscale, width, height) {
  const imageData = new ImageData(width, height);

  for (let i = 0; i < grayscale.length; i++) {
    const value = Math.max(0, Math.min(255, grayscale[i]));
    imageData.data[i * 4] = value;
    imageData.data[i * 4 + 1] = value;
    imageData.data[i * 4 + 2] = value;
    imageData.data[i * 4 + 3] = 255;
  }

  return imageData;
}

export function computeFFT(grayscale, width, height) {
  // Pad to power of 2
  const paddedWidth = nextPowerOf2(width);
  const paddedHeight = nextPowerOf2(height);

  const padded = new Float64Array(paddedWidth * paddedHeight);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      padded[y * paddedWidth + x] = grayscale[y * width + x];
    }
  }

  // Compute FFT
  const { real, imag } = fft2d(padded, paddedWidth, paddedHeight);

  // Shift to center
  const shiftedReal = fftShift(real, paddedWidth, paddedHeight);
  const shiftedImag = fftShift(imag, paddedWidth, paddedHeight);

  // Compute magnitude and phase
  const magnitude = computeMagnitude(shiftedReal, shiftedImag);
  const phase = computePhase(shiftedReal, shiftedImag);

  return {
    magnitude,
    phase,
    real: shiftedReal,
    imaginary: shiftedImag,
    paddedWidth,
    paddedHeight,
  };
}

export function normalizeForDisplay(data, useLog = true) {
  const result = new Uint8ClampedArray(data.length);

  let processedData = data;
  if (useLog) {
    processedData = new Float64Array(data.length);
    for (let i = 0; i < data.length; i++) {
      processedData[i] = Math.log(1 + Math.abs(data[i]));
    }
  }

  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < processedData.length; i++) {
    if (processedData[i] < min) min = processedData[i];
    if (processedData[i] > max) max = processedData[i];
  }

  const range = max - min || 1;

  for (let i = 0; i < processedData.length; i++) {
    result[i] = Math.round(((processedData[i] - min) / range) * 255);
  }

  return result;
}

export function createRegionMask(width, height, percentage, type) {
  const mask = new Float64Array(width * height);
  const centerX = width / 2;
  const centerY = height / 2;

  const regionSize = percentage / 100;
  const halfWidth = (width * regionSize) / 2;
  const halfHeight = (height * regionSize) / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = Math.abs(x - centerX);
      const dy = Math.abs(y - centerY);

      const isInner = dx <= halfWidth && dy <= halfHeight;

      if (type === "inner") {
        mask[y * width + x] = isInner ? 1 : 0;
      } else {
        mask[y * width + x] = isInner ? 0 : 1;
      }
    }
  }

  return mask;
}

export async function loadImage(file) {
  // Read the file as a data URL
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Create an image element and wait for it to load
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = dataUrl;
  });

  return img;
}

export function imageToCanvas(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  return canvas;
}

export function canvasToGrayscale(canvas) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const grayscale = convertToGrayscale(imageData);

  return {
    grayscale,
    width: canvas.width,
    height: canvas.height,
  };
}
