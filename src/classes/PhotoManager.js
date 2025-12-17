import { Photo } from "./Image";

/**
 * PhotoManager class manages a collection of 6 Photo instances
 * Handles coordinated operations across all photos
 * 4 inputs (indices 0-3) + 2 outputs (indices 4-5)
 */
export class PhotoManager {
  constructor() {
    // Create 6 photo instances: 4 inputs and 2 outputs
    this.photos = [
      new Photo("input-1", false),
      new Photo("input-2", false),
      new Photo("input-3", false),
      new Photo("input-4", false),
      new Photo("output-1", true),
      new Photo("output-2", true),
    ];
  }

  /**
   * Get a photo by index (0-5)
   */
  getPhoto(index) {
    if (index < 0 || index >= 6) {
      console.warn(`Photo index ${index} out of bounds (0-5)`);
      return null;
    }
    return this.photos[index];
  }

  /**
   * Get photo by ID
   */
  getPhotoById(id) {
    return this.photos.find((p) => p.id === id) || null;
  }

  /**
   * Get all input photos (indices 0-3)
   */
  getInputPhotos() {
    return this.photos.slice(0, 4);
  }

  /**
   * Get all output photos (indices 4-5)
   */
  getOutputPhotos() {
    return this.photos.slice(4, 6);
  }

  /**
   * Set image data for an input photo
   */
  setInputImage(index, grayscaleData, width, height, displayW, displayH) {
    const photo = this.getPhoto(index);
    if (photo && !photo.isOutput) {
      photo.setGrayscale(grayscaleData, width, height, displayW, displayH);
    }
  }

  /**
   * Set output image data
   */
  setOutputImage(index, outputData, width, height, displayW, displayH) {
    const photo = this.getPhoto(index);
    if (photo && photo.isOutput) {
      photo.setOutputImage(outputData, width, height, displayW, displayH);
    }
  }

  /**
   * Reset all photos to initial state
   */
  resetAll() {
    this.photos.forEach((photo) => photo.reset());
  }

  /**
   * Reset a specific photo by index
   */
  reset(index) {
    const photo = this.getPhoto(index);
    if (photo) {
      photo.reset();
    }
  }

  /**
   * Set region settings for all output photos
   */
  setRegionForOutputs(percentage, type, show) {
    this.getOutputPhotos().forEach((photo) => {
      photo.setRegion(percentage, type, show);
    });
  }

  /**
   * Set FT component display for all photos
   */
  setFtComponentForAll(component) {
    this.photos.forEach((photo) => {
      photo.setFtComponent(component);
    });
  }

  /**
   * Set brightness/contrast adjustments for image display
   */
  setImageBrightnessContrast(index, brightness, contrast) {
    const photo = this.getPhoto(index);
    if (photo) {
      photo.setBrightness(brightness);
      photo.setContrast(contrast);
    }
  }

  /**
   * Set brightness/contrast adjustments for FT display
   */
  setFtBrightnessContrast(index, brightness, contrast) {
    const photo = this.getPhoto(index);
    if (photo) {
      photo.setFtBrightness(brightness);
      photo.setFtContrast(contrast);
    }
  }

  /**
   * Set selection state for an output photo
   */
  setOutputSelected(index, selected) {
    const photo = this.getPhoto(index);
    if (photo && photo.isOutput) {
      photo.setSelected(selected);
    }
  }

  /**
   * Get count of photos with images loaded
   */
  getLoadedInputCount() {
    return this.getInputPhotos().filter((p) => p.hasImage()).length;
  }

  /**
   * Check if all inputs have images
   */
  areAllInputsLoaded() {
    return this.getInputPhotos().every((p) => p.hasImage());
  }

  /**
   * Get all photos that have FT data
   */
  getPhotosWithFT() {
    return this.photos.filter((p) => p.hasFTData());
  }
}
