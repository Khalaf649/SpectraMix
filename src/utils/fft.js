// FFT Implementation for 2D Image Processing

export function fft1d(real, imag) {
  const n = real.length;
  if (n <= 1) return;

  // Bit reversal
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
    let k = n >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  // Cooley-Tukey FFT
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (-2 * Math.PI) / len;
    const wReal = Math.cos(angle);
    const wImag = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let curReal = 1;
      let curImag = 0;

      for (let k = 0; k < halfLen; k++) {
        const evenIdx = i + k;
        const oddIdx = i + k + halfLen;

        const tReal = curReal * real[oddIdx] - curImag * imag[oddIdx];
        const tImag = curReal * imag[oddIdx] + curImag * real[oddIdx];

        real[oddIdx] = real[evenIdx] - tReal;
        imag[oddIdx] = imag[evenIdx] - tImag;
        real[evenIdx] += tReal;
        imag[evenIdx] += tImag;

        const newReal = curReal * wReal - curImag * wImag;
        curImag = curReal * wImag + curImag * wReal;
        curReal = newReal;
      }
    }
  }
}

export function ifft1d(real, imag) {
  const n = real.length;

  // Conjugate
  for (let i = 0; i < n; i++) {
    imag[i] = -imag[i];
  }

  // Forward FFT
  fft1d(real, imag);

  // Conjugate and scale
  for (let i = 0; i < n; i++) {
    real[i] /= n;
    imag[i] = -imag[i] / n;
  }
}

export function fft2d(data, width, height) {
  const real = new Float64Array(data);
  const imag = new Float64Array(width * height);

  // FFT on rows
  for (let y = 0; y < height; y++) {
    const rowReal = new Float64Array(width);
    const rowImag = new Float64Array(width);

    for (let x = 0; x < width; x++) {
      rowReal[x] = real[y * width + x];
      rowImag[x] = imag[y * width + x];
    }

    fft1d(rowReal, rowImag);

    for (let x = 0; x < width; x++) {
      real[y * width + x] = rowReal[x];
      imag[y * width + x] = rowImag[x];
    }
  }

  // FFT on columns
  for (let x = 0; x < width; x++) {
    const colReal = new Float64Array(height);
    const colImag = new Float64Array(height);

    for (let y = 0; y < height; y++) {
      colReal[y] = real[y * width + x];
      colImag[y] = imag[y * width + x];
    }

    fft1d(colReal, colImag);

    for (let y = 0; y < height; y++) {
      real[y * width + x] = colReal[y];
      imag[y * width + x] = colImag[y];
    }
  }

  return { real, imag };
}

export function ifft2d(real, imag, width, height) {
  const resultReal = new Float64Array(real);
  const resultImag = new Float64Array(imag);

  // IFFT on rows
  for (let y = 0; y < height; y++) {
    const rowReal = new Float64Array(width);
    const rowImag = new Float64Array(width);

    for (let x = 0; x < width; x++) {
      rowReal[x] = resultReal[y * width + x];
      rowImag[x] = resultImag[y * width + x];
    }

    ifft1d(rowReal, rowImag);

    for (let x = 0; x < width; x++) {
      resultReal[y * width + x] = rowReal[x];
      resultImag[y * width + x] = rowImag[x];
    }
  }

  // IFFT on columns
  for (let x = 0; x < width; x++) {
    const colReal = new Float64Array(height);
    const colImag = new Float64Array(height);

    for (let y = 0; y < height; y++) {
      colReal[y] = resultReal[y * width + x];
      colImag[y] = resultImag[y * width + x];
    }

    ifft1d(colReal, colImag);

    for (let y = 0; y < height; y++) {
      resultReal[y * width + x] = colReal[y];
      resultImag[y * width + x] = colImag[y];
    }
  }

  return resultReal;
}

export function fftShift(data, width, height) {
  const result = new Float64Array(data.length);
  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const newX = (x + halfW) % width;
      const newY = (y + halfH) % height;
      result[newY * width + newX] = data[y * width + x];
    }
  }

  return result;
}

export function ifftShift(data, width, height) {
  const result = new Float64Array(data.length);
  const halfW = Math.ceil(width / 2);
  const halfH = Math.ceil(height / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const newX = (x + halfW) % width;
      const newY = (y + halfH) % height;
      result[newY * width + newX] = data[y * width + x];
    }
  }

  return result;
}

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

export function polarToCartesian(magnitude, phase) {
  const real = new Float64Array(magnitude.length);
  const imag = new Float64Array(magnitude.length);

  for (let i = 0; i < magnitude.length; i++) {
    real[i] = magnitude[i] * Math.cos(phase[i]);
    imag[i] = magnitude[i] * Math.sin(phase[i]);
  }

  return { real, imag };
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
