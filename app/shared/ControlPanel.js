export class ControlPanel {
  constructor(layoutContainer) {
    this.layoutContainer = layoutContainer;
    this.weights = [
      { magnitude: 0.25, phase: 0.25 },
      { magnitude: 0.25, phase: 0.25 },
      { magnitude: 0.25, phase: 0.25 },
      { magnitude: 0.25, phase: 0.25 },
    ];
    this.createLayout();
    this.renderWeights();
  }

  createLayout() {
    // Create control panel container
    const controlPanel = document.createElement("div");
    controlPanel.id = "control-panel";
    controlPanel.className = "control-panel mixer-controls-container";
    controlPanel.innerHTML = `
      <div class="mixer-section-header">
       <h3 class="mixer-section-title">Components Mixer</h3>
       <select class="select-trigger select-trigger-sm select-content select-scroll-btn"> 
       <option class="select-option" value="mag-phase">Magnitude / Phase</option>
       <option class="select-option" value="real-imag">Real / Imaginary</option>
       </select>
       </div>
        <div class="mixer-weights-list" id="weights-list"></div>
    `;
    this.layoutContainer.appendChild(controlPanel);
    this.weightsList = controlPanel.querySelector("#weights-list");

  }
  renderWeights() {
    this.weightsList.innerHTML = this.weights
      .map(
        (w, idx) => `
      <div class="weight-slider-container">
        <div class="weight-slider-header">
          <span class="weight-slider-label">Image ${idx + 1}</span>
        </div>
        <div class="weight-slider-grid">
          <div class="weight-slider-col">
            <div class="weight-slider-row">
              <span class="text-signal-cyan">Magnitude</span>
              <span class="weight-value">${(w.magnitude * 100).toFixed(
                0
              )}%</span>
            </div>
            <input type="range" class="slider-root slider-thumb slider-track slider-range" data-type="magnitude" data-idx="${idx}" 
                   value="${w.magnitude * 100}" min="0" max="100" step="1">
          </div>
          <div class="weight-slider-col">
            <div class="weight-slider-row">
              <span class="text-signal-magenta">Phase</span>
              <span class="weight-value">${(w.phase * 100).toFixed(0)}%</span>
            </div>
            <input type="range" class="slider-root slider-thumb slider-track slider-range" data-type="phase" data-idx="${idx}" 
                   value="${w.phase * 100}" min="0" max="100" step="1">
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }
}
