export class ControlPanel {
  constructor(layoutContainer) {
    this.layoutContainer = layoutContainer;
    this.currentMode = "region"; // 'component' or 'region'
    this.loadedImageIndices = [
      { componentA: 0.25, componentB: 0.25 },
      { componentA: 0.25, componentB: 0.25 },
      { componentA: 0.25, componentB: 0.25 },
      { componentA: 0.25, componentB: 0.25 },
    ];

    this.selectedOutput = 1;
    this.isProcessing = false;
    this.createLayout();
  }

  createLayout() {
    // Create control panel container
    const controlPanel = document.createElement("div");
    controlPanel.id = "control-panel";
    controlPanel.className = "control-panel mixer-controls-container";
    controlPanel.innerHTML = `
    <div class="mixer-mode-toggle">
      <button 
        class="btn btn-sm flex-1 ${
          this.currentMode === "component" ? "btn-default" : "btn-secondary"
        }"
      >
        Component
      </button>
      <button 
        class="btn btn-sm flex-1 ${
          this.currentMode === "region" ? "btn-default" : "btn-secondary"
        }"
      >
        Region
      </button>
    </div>
    <div class="mixer-section-header">
    <h3 class="mixer-section-title">${
      this.currentMode === "component" ? "Components Mixer" : "Region Mixer"
    }</h3> 
    <select class="select-trigger select-trigger-sm select-content select-scroll-btn" >
      <option class="select-item" value="mag-phase">Mag/Phase</option>
      <option class="select-item" value="real-imag">Real/Imag</option>
    </select>
    </div>
    
    ${
      this.currentMode === "region"
        ? `
    <div class="region-global-controls">
      <div class="region-slider-row">
        <div class="region-slider-header">
          <span class="region-slider-label">Size (all images)</span>
          <span class="region-value">50%</span>
        </div>
        <div class="slider-root">
          <div class="slider-track">
            <div class="slider-range" style="width: 50%"></div>
          </div>
          <div class="slider-thumb" style="left: 50%"></div>
          <input 
            type="range"
            class="slider-input"
            id="global-size-slider"
            value="50"
            min="10"
            max="100"
            step="5"
          >
        </div>
      </div>
      
      <div class="region-selector-row">
        <label class="region-selector-label">Region</label>
        <select id="global-region-select" class="select-trigger select-trigger-sm select-content select-scroll-btn">
          <option class="select-item" value="inner">Inner</option>
          <option class="select-item" value="outer">Outer</option>
        </select>
      </div>
    </div>
    `
        : ""
    }
  
    ${
      this.loadedImageIndices.length > 0
        ? `<div id="weights-list" class="mixer-weights-list"> </div>`
        : ""
    }
    ${
      this.loadedImageIndices.length === 0
        ? `<p class="region-empty-text">Load image to configure mixer</p>`
        : ""
    }
  <div class="output-target-section">
  <h4 class="mixer-section-title">Output Target</h4>
  <div class="output-buttons">
    <button class="btn btn-sm flex-1 ${
      this.selectedOutput === 1 ? "btn-default" : "btn-secondary"
    }">
      Output 1
    </button>

    <button class="btn btn-sm flex-1 ${
      this.selectedOutput === 2 ? "btn-default" : "btn-secondary"
    }">
      Output 2
    </button>
  </div>
</div>


<div class="mix-action-section">
  ${
    this.isProcessing
      ? ""
      : '<button class="btn w-full gradient-primary text-primary-foreground"><i data-lucide="play"></i> Mix Images</button>'
  }
</div>

    </div>
  `;
    this.layoutContainer.appendChild(controlPanel);
    this.weightsList = controlPanel.querySelector("#weights-list");

    this.renderWeights();
  }

  renderWeights() {
    this.weightsList.innerHTML = this.loadedImageIndices
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
      <span class="weight-value">${(w.componentA * 100).toFixed(0)}%</span>
    </div>

    <div class="slider-root" data-type="magnitude" data-idx="${idx}">
      <div class="slider-track">
        <div class="slider-range" style="width: ${w.componentA * 100}%"></div>
      </div>
      <div class="slider-thumb" style="left: ${w.componentA * 100}%"></div>
      <input 
        type="range" 
        class="slider-input"
        value="${w.componentA * 100}"
        min="0"
        max="100"
        step="1"
      >
    </div>
  </div>

  <div class="weight-slider-col">
    <div class="weight-slider-row">
      <span class="text-signal-magenta">Phase</span>
      <span class="weight-value">${(w.componentB * 100).toFixed(0)}%</span>
    </div>

    <div class="slider-root" data-type="phase" data-idx="${idx}">
      <div class="slider-track">
        <div class="slider-range" style="width: ${w.componentB * 100}%"></div>
      </div>
      <div class="slider-thumb" style="left: ${w.componentB * 100}%"></div>
      <input 
        type="range" 
        class="slider-input"
        value="${w.componentB * 100}"
        min="0"
        max="100"
        step="1"
      >
    </div>
  </div>

</div>

      </div>
    `
      )
      .join("");
  }
}
