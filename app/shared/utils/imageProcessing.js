// utils/imageProcessing.js
export function toGrayscale(imageData) {
  const data = imageData.data;
  const gray = new Uint8ClampedArray(imageData.width * imageData.height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const grayVal = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    gray[i / 4] = grayVal;
  }

  return { data: gray, width: imageData.width, height: imageData.height };
}

export function applyBrightnessContrast(
  grayArray,
  brightness,
  contrast,
  width,
  height
) {
  const result = new Uint8ClampedArray(grayArray.length);
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < grayArray.length; i++) {
    let val = grayArray[i];
    val = factor * (val - 128) + 128 + brightness;
    result[i] = Math.max(0, Math.min(255, val));
  }

  return result;
}

export function normalizeForDisplay(ftData, useLog = true) {
  const absData = new Float64Array(ftData.length);
  let min = Infinity,
    max = -Infinity;

  for (let i = 0; i < ftData.length; i += 2) {
    const re = ftData[i];
    const im = ftData[i + 1];
    const val = useLog
      ? Math.log(1 + Math.sqrt(re * re + im * im))
      : Math.sqrt(re * re + im * im);
    absData[i / 2] = val;
    min = Math.min(min, val);
    max = Math.max(max, val);
  }

  const range = max - min || 1;
  const result = new Uint8ClampedArray(absData.length);
  for (let i = 0; i < absData.length; i++) {
    result[i] = ((absData[i] - min) / range) * 255;
  }

  return result;
}

export function arrayToImageData(array, width, height) {
  const imageData = new ImageData(width, height);
  const data = imageData.data;
  for (let i = 0; i < array.length; i++) {
    const val = array[i];
    const j = i * 4;
    data[j] = data[j + 1] = data[j + 2] = val;
    data[j + 3] = 255;
  }
  return imageData;
}
