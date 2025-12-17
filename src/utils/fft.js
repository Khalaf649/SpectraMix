// FFT Implementation for 2D Image Processing
import FFT from "fft.js";

export function computeMagnitude(real, imag) {
  const result = new Float64Array(real.length);
  for (let i = 0; i < real.length; i++) {
    result[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
  }
  return result;
}

export function computePhase(real, imag) {
  const result = new Float64Array(real.length);
  for (let i = 0; i < real.length; i++) {
    result[i] = Math.atan2(imag[i], real[i]);
  }
  return result;
}

export function nextPowerOf2(n) {
  let power = 1;
  while (power < n) {
    power *= 2;
  }
  return power;
}

export function padToPowerOf2(data, width, height) {
  const newWidth = nextPowerOf2(width);
  const newHeight = nextPowerOf2(height);
  const padded = new Float64Array(newWidth * newHeight);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      padded[y * newWidth + x] = data[y * width + x];
    }
  }

  return { padded, newWidth, newHeight };
}

/**
 * Performs 2D FFT and FFT-Shift.
 *
 * @param {Float32Array|Array} grayScale - Flat array of image intensity (0-255).
 * @param {number} width - Image width (Must be power of 2).
 * @param {number} height - Image height (Must be power of 2).
 * @returns {Object} { real: Float32Array, imag: Float32Array } - Shifted frequency data.
 */
export const fft2d = (grayScale, width, height) => {
  const size = width * height;
  console.log("Performing __fft2d on size:", width, "x", height);

  // 1. Initialize Real & Imaginary arrays
  // We copy grayScale into 'real' to avoid mutating the original input
  const real = new Float32Array(size);
  const imag = new Float32Array(size);

  for (let i = 0; i < size; i++) {
    // parse the real and the imaginary parts
    real[i] = grayScale[i];
    imag[i] = 0;
  }

  // =========================================================
  // STEP 1: FFT on Rows (Horizontal)
  // =========================================================
  const fftRow = new FFT(width);
  const rowIn = fftRow.createComplexArray();
  const rowOut = fftRow.createComplexArray();

  for (let y = 0; y < height; y++) {
    const offset = y * width;

    // Fill input buffer for this row
    for (let x = 0; x < width; x++) {
      rowIn[2 * x] = real[offset + x];
      rowIn[2 * x + 1] = imag[offset + x];
    }

    // Perform Transform
    fftRow.transform(rowOut, rowIn);

    // Write back to main arrays
    for (let x = 0; x < width; x++) {
      real[offset + x] = rowOut[2 * x];
      imag[offset + x] = rowOut[2 * x + 1];
    }
  }

  // =========================================================
  // STEP 2: FFT on Columns (Vertical)
  // =========================================================
  const fftCol = new FFT(height);
  const colIn = fftCol.createComplexArray();
  const colOut = fftCol.createComplexArray();

  for (let x = 0; x < width; x++) {
    // Fill input buffer for this column
    for (let y = 0; y < height; y++) {
      const idx = y * width + x;
      colIn[2 * y] = real[idx];
      colIn[2 * y + 1] = imag[idx];
    }

    // Perform Transform
    fftCol.transform(colOut, colIn);

    // Write back to main arrays
    for (let y = 0; y < height; y++) {
      const idx = y * width + x;
      real[idx] = colOut[2 * y];
      imag[idx] = colOut[2 * y + 1];
    }
  }

  // =========================================================
  // STEP 3: FFT Shift (Center Low Frequencies)
  // We swap Quadrant 1 with 4, and Quadrant 2 with 3.
  // =========================================================
  const shiftedReal = new Float32Array(size);
  const shiftedImag = new Float32Array(size);

  const halfW = width / 2;
  const halfH = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Calculate current index
      const currentIdx = y * width + x;

      // Calculate target index (shifting by half width/height)
      const newY = (y + halfH) % height;
      const newX = (x + halfW) % width;
      const targetIdx = newY * width + newX;

      // Move data
      shiftedReal[targetIdx] = real[currentIdx];
      shiftedImag[targetIdx] = imag[currentIdx];
    }
  }

  return {
    real: shiftedReal,
    imag: shiftedImag,
  };
};
