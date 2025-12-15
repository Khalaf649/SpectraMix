import InputViewPorts from "./InputViewPorts.jsx";
import OutputViewPorts from "./OutPutViewPorts.jsx";
import MixerControls from "./MixerControls.jsx";

import {
  canvasToGrayscale,
  resizeImage,
  computeFFT,
  loadImage,
  imageToCanvas,
} from "../utils/imageProcessing.js";

import { useState, useRef, useEffect } from "react";
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

  const initialOutputState = {
    image: null,
    ftMagnitude: null,
    ftPhase: null,
    ftReal: null,
    ftImaginary: null,
    width: 0,
    height: 0,
  };

  const initalWeights = [
    { component1Gain: 0.25, component2Gain: 0.25 },
    { component1Gain: 0.25, component2Gain: 0.25 },
    { component1Gain: 0.25, component2Gain: 0.25 },
    { component1Gain: 0.25, component2Gain: 0.25 },
  ];
  const initialRegionSettings = { size: 50, region: "inner" };

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
  const [componentType, setComponentType] = useState("mag-phase");
  const [regionSettings, setRegionSettings] = useState({
    size: 50,
    region: "inner",
  });
  const [progress, setProgress] = useState(0);
  // const abortControllerRef = useRef(null);

  const [unifiedSize, setUnifiedSize] = useState({ width: 0, height: 0 });
  const originalCanvasesRef = useRef([null, null, null, null]);

  const handleUnifySize = () => {
    const loadedImages = originalCanvasesRef.current.filter((c) => c !== null);
    if (loadedImages.length === 0) {
      setUnifiedSize({ width: 0, height: 0 });
      return;
    }

    // Find the image with the smallest area
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

    // Set unified size to the dimensions of the smallest image
    setUnifiedSize({ width: smallest.width, height: smallest.height });
  };
  const getLoadedImageIndices = () =>
    images
      .map((img, idx) => (img.grayscale !== null ? idx : -1))
      .filter((i) => i !== -1);

  useEffect(() => {
    if (unifiedSize.width === 0 || unifiedSize.height === 0) return;
    const processAll = async () => {
      const newImages = [...images];
      for (let i = 0; i < 4; i++) {
        const canvas = originalCanvasesRef.current[i];
        if (!canvas) continue;
        const resizedCanvas = resizeImage(
          canvas,
          unifiedSize.width,
          unifiedSize.height
        );
        const { grayscale, width, height } = canvasToGrayscale(resizedCanvas);
        const fftResult = computeFFT(grayscale, width, height);
        newImages[i] = {
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
      setImages(newImages);
    };
    processAll();
  }, [unifiedSize]);

  // Inside your component
  const handleImageLoad = async (id, file) => {
    try {
      // Load the image
      const img = await loadImage(file);

      // Convert to canvas
      const canvas = imageToCanvas(img);

      // Store the canvas in ref
      originalCanvasesRef.current[id - 1] = canvas;

      // Update unified size
      handleUnifySize();
    } catch (error) {
      console.error(error);
    }
  };
  const handleRegionSetting = (key, value) => {
    setRegionSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleWeights = (index, key, value) => {
    setWeights((prev) => {
      const newWeights = [...prev];
      newWeights[index] = {
        ...newWeights[index],
        [key]: value,
      };
      return newWeights;
    });
  };

  const handleMix = () => {
    // Implement mixing logic here
  };
  const handleCancel = () => {
    // Implement cancel logic here
  };
  const hasImages = images.some((img) => img.grayscale !== null);

  return (
    <div className="ft-mixer-layout">
      <InputViewPorts
        images={images}
        handleImageLoad={handleImageLoad}
        mixerMode={mixerMode}
        regionSettings={regionSettings}
        unifiedSize={unifiedSize}
      />

      <MixerControls
        weights={weights}
        onWeightChange={handleWeights}
        mixerMode={mixerMode}
        onMixerModeChange={setMixerMode}
        regionSettings={regionSettings}
        onRegionSettingChange={handleRegionSetting}
        // sharedRegionSettings={sharedRegionSettings}
        // onSharedRegionSettingsChange={handleSharedRegionSettingsChange}
        componentType={componentType}
        onComponentTypeChange={setComponentType}
        selectedOutput={selectedOutput}
        onSelectedOutputChange={setSelectedOutput}
        onMix={handleMix}
        onCancel={handleCancel}
        isProcessing={isProcessing}
        progress={progress}
        hasImages={hasImages}
        loadedImageIndices={getLoadedImageIndices()}
      />

      <OutputViewPorts
        outputs={outputs}
        selectedOutput={selectedOutput}
        setSelectedOutput={setSelectedOutput}
        unifiedSize={unifiedSize}
      />
    </div>
  );
}
export default FTMixer;
