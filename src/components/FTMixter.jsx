import InputViewPorts from "./InputViewPorts.jsx";
import OutputViewPorts from "./OutPutViewPorts.jsx";
import MixerControls from "./MixerControls.jsx";

import {
  canvasToGrayscale,
  resizeCanvas,
  computeFFT,
  loadImage,
  imageToCanvas,
  unifiedMixer,
} from "../utils/imageProcessing.js";
import { Ifft2d } from "../utils/fft.js";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

function FTMixer() {
  const initialImageState = {
    grayscale: null,
    width: 0,
    height: 0,
    paddedWidth: 0,
    paddedHeight: 0,
    ftMagnitude: null,
    ftPhase: null,
    ftReal: null,
    ftImaginary: null,
  };

  const initialOutputState = { ...initialImageState };

  const initalWeights = [
    { component1Gain: 0.25, component2Gain: 0.25 },
    { component1Gain: 0.25, component2Gain: 0.25 },
    { component1Gain: 0.25, component2Gain: 0.25 },
    { component1Gain: 0.25, component2Gain: 0.25 },
  ];

  // Refactored: size removed, coordinates added
  const [regionSettings, setRegionSettings] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isInner: true,
  });

  const [images, setImages] = useState([
    { ...initialImageState },
    { ...initialImageState },
    { ...initialImageState },
    { ...initialImageState },
  ]);

  const [weights, setWeights] = useState(initalWeights);
  const [outputs, setOutputs] = useState([
    { ...initialOutputState },
    { ...initialOutputState },
  ]);

  const [mixerMode, setMixerMode] = useState("component");
  const [selectedOutput, setSelectedOutput] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [componentType, setComponentType] = useState("Mag/Phase");

  const abortControllerRef = useRef(null);
  const [unifiedSize, setUnifiedSize] = useState({ width: 0, height: 0 });
  const originalCanvasesRef = useRef([null, null, null, null]);

  const handleUnifySize = useCallback(() => {
    const loadedImages = originalCanvasesRef.current.filter((c) => c !== null);
    if (loadedImages.length === 0) {
      setUnifiedSize({ width: 0, height: 0 });
      return;
    }

    let smallest = loadedImages[0];
    let smallestArea = smallest.width * smallest.height;

    for (let i = 1; i < loadedImages.length; i++) {
      const img = loadedImages[i];
      const area = img.width * img.height;
      if (area < smallestArea) {
        smallest = img;
        smallestArea = area;
      }
    }
    setUnifiedSize({ width: smallest.width, height: smallest.height });
  }, []);

  const loadedImageIndices = useMemo(
    () =>
      images
        .map((img, idx) => (img.grayscale !== null ? idx : -1))
        .filter((idx) => idx !== -1),
    [images]
  );

  useEffect(() => {
    if (unifiedSize.width === 0 || unifiedSize.height === 0) return;
    const processAll = async () => {
      setImages((prev) => {
        const next = [...prev];
        for (let i = 0; i < 4; i++) {
          const canvas = originalCanvasesRef.current[i];
          if (!canvas) continue;
          const resizedCanvas = resizeCanvas(
            canvas,
            unifiedSize.width,
            unifiedSize.height
          );
          const { grayscale, width, height } = canvasToGrayscale(resizedCanvas);
          const fftResult = computeFFT(grayscale, width, height);

          next[i] = {
            grayscale,
            width,
            height,
            paddedWidth: fftResult.paddedWidth,
            paddedHeight: fftResult.paddedHeight,
            ftMagnitude: fftResult.magnitude,
            ftPhase: fftResult.phase,
            ftReal: fftResult.real,
            ftImaginary: fftResult.imaginary,
          };
        }
        return next;
      });
    };

    processAll();
  }, [unifiedSize]);

  const handleImageLoad = useCallback(
    async (id, file) => {
      try {
        const img = await loadImage(file);
        const canvas = imageToCanvas(img);
        originalCanvasesRef.current[id - 1] = canvas;
        handleUnifySize();
      } catch (error) {
        console.error(error);
      }
    },
    [handleUnifySize]
  );

  // Still useful for MixerControls to toggle isInner
  const handleRegionSetting = useCallback((key, value) => {
    setRegionSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleWeights = useCallback((index, key, value) => {
    setWeights((prev) => {
      const newWeights = [...prev];
      newWeights[index] = { ...newWeights[index], [key]: value };
      return newWeights;
    });
  }, []);

  const handleMix = useCallback(async () => {
    const loadedImages = images.filter((img) => img.grayscale !== null);
    if (loadedImages.length === 0) {
      alert("Please load at least one image to mix.");
      return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const loadedWeights = weights.slice(0, loadedImages.length);
    const pWidth = loadedImages[0].paddedWidth;
    const pHeight = loadedImages[0].paddedHeight;

    const isRegionMode = mixerMode === "region";

    let startX, endX, startY, endY, activeInner;

    if (isRegionMode) {
      // Use coordinates directly from state
      startX = Math.max(0, Math.min(pWidth, Math.floor(regionSettings.startX)));
      startY = Math.max(
        0,
        Math.min(pHeight, Math.floor(regionSettings.startY))
      );
      endX = Math.max(0, Math.min(pWidth, Math.floor(regionSettings.endX)));
      endY = Math.max(0, Math.min(pHeight, Math.floor(regionSettings.endY)));

      if (endX < startX) [startX, endX] = [endX, startX];
      if (endY < startY) [startY, endY] = [endY, startY];
      activeInner = regionSettings.isInner;
    } else {
      startX = 0;
      endX = pWidth;
      startY = 0;
      endY = pHeight;
      activeInner = true;
    }

    setIsProcessing(true);

    try {
      if (signal.aborted) throw new Error("Operation cancelled");
      await new Promise((resolve) => setTimeout(resolve, 0));

      const { ftReal, ftImaginary, ftMagnitude, ftPhase } = unifiedMixer(
        loadedImages,
        loadedWeights,
        componentType,
        activeInner,
        startX,
        startY,
        endX,
        endY
      );

      if (signal.aborted) throw new Error("Operation cancelled");
      await new Promise((resolve) => setTimeout(resolve, 0));

      const paddedReconstructed = Ifft2d(ftReal, ftImaginary, pWidth, pHeight);

      if (signal.aborted) throw new Error("Operation cancelled");

      const croppedGrayscale = new Float32Array(
        unifiedSize.width * unifiedSize.height
      );

      for (let y = 0; y < unifiedSize.height; y++) {
        for (let x = 0; x < unifiedSize.width; x++) {
          const paddedIdx = y * pWidth + x;
          const croppedIdx = y * unifiedSize.width + x;
          croppedGrayscale[croppedIdx] = paddedReconstructed[paddedIdx];
        }
      }

      setOutputs((prev) => {
        const newOutputs = [...prev];
        const idx = selectedOutput - 1;
        newOutputs[idx] = {
          ...newOutputs[idx],
          grayscale: croppedGrayscale,
          width: unifiedSize.width,
          height: unifiedSize.height,
          paddedWidth: pWidth,
          paddedHeight: pHeight,
          ftReal: ftReal,
          ftImaginary: ftImaginary,
          ftPhase: ftPhase,
          ftMagnitude: ftMagnitude,
        };
        return newOutputs;
      });
    } catch (error) {
      if (error.message !== "Operation cancelled") {
        console.error("Mixing Error:", error);
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [
    images,
    weights,
    componentType,
    mixerMode,
    regionSettings,
    selectedOutput,
    unifiedSize,
  ]);

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
    }
  }, []);

  return (
    <div className="ft-mixer-layout">
      <InputViewPorts
        images={images}
        handleImageLoad={handleImageLoad}
        mixerMode={mixerMode}
        regionSettings={regionSettings}
        setRegionSettings={setRegionSettings} // Passed for mouse interaction
      />

      <MixerControls
        weights={weights}
        onWeightChange={handleWeights}
        mixerMode={mixerMode}
        onMixerModeChange={setMixerMode}
        regionSettings={regionSettings}
        onRegionSettingChange={handleRegionSetting}
        componentType={componentType}
        onComponentTypeChange={setComponentType}
        selectedOutput={selectedOutput}
        onSelectedOutputChange={setSelectedOutput}
        onMix={handleMix}
        onCancel={handleCancel}
        isProcessing={isProcessing}
        loadedImageIndices={loadedImageIndices}
      />

      <OutputViewPorts
        outputs={outputs}
        selectedOutput={selectedOutput}
        setSelectedOutput={setSelectedOutput}
      />
    </div>
  );
}

export default FTMixer;
