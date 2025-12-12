// import { KissFFT } from "kissfft-js";

// function computeFFT(grayData, width, height) {
//   // reshape 1D → 2D
//   const img = [];
//   for (let y = 0; y < height; y++) {
//     img.push(grayData.slice(y * width, (y + 1) * width));
//   }

//   // allocate output 2D arrays
//   const real = Array.from({ length: height }, () => Array(width).fill(0));
//   const imag = Array.from({ length: height }, () => Array(width).fill(0));

//   // ---------- STEP 1: FFT ROWS ----------
//   const rowReal = Array.from({ length: height });
//   const rowImag = Array.from({ length: height });

//   for (let y = 0; y < height; y++) {
//     const { real: r, imag: i } = fft1D_kiss(img[y]);
//     rowReal[y] = r;
//     rowImag[y] = i;
//   }

//   // ---------- STEP 2: FFT COLUMNS ----------
//   for (let x = 0; x < width; x++) {
//     // extract column from row-FFT
//     const colReal = new Float32Array(height);
//     const colImag = new Float32Array(height);

//     for (let y = 0; y < height; y++) {
//       colReal[y] = rowReal[y][x];
//       colImag[y] = rowImag[y][x];
//     }

//     // FFT column
//     const fft = new KissFFT(height);
//     const outReal = new Float32Array(height);
//     const outImag = new Float32Array(height);

//     fft.forwardComplex(colReal, colImag, outReal, outImag);

//     // store into output matrix
//     for (let y = 0; y < height; y++) {
//       real[y][x] = outReal[y];
//       imag[y][x] = outImag[y];
//     }
//   }

//   // ---------- STEP 3: MAGNITUDE + PHASE ----------
//   const magnitude = Array.from({ length: height }, () => Array(width).fill(0));
//   const phase = Array.from({ length: height }, () => Array(width).fill(0));

//   for (let y = 0; y < height; y++) {
//     for (let x = 0; x < width; x++) {
//       const re = real[y][x];
//       const im = imag[y][x];

//       magnitude[y][x] = Math.hypot(re, im);
//       phase[y][x] = Math.atan2(im, re);
//     }
//   }

//   return { real, imag, magnitude, phase };
// }
// export default computeFFT;
