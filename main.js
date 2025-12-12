// main.js - A very few codes in main function
import { FTMixer } from "./app/FTMixer.js"; // Part A
import { BeamformingSimulator } from "./app/BeamformingSimulator.js"; // Part B

class App {
  constructor() {
    this.ftMixer = new FTMixer(); // Part A
    this.beamSimulator = new BeamformingSimulator(); // Part B
    this.currentMode = this.ftMixer; // Default to FT
    this.setupUI();
  }

  setupUI() {
    // Set up tabs and switch modes on click
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        this.currentMode.hide();
        this.currentMode =
          tab.dataset.mode === "ft" ? this.ftMixer : this.beamSimulator;
        document
          .querySelectorAll(".tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.currentMode.show();
      });
    });
  }
}

new App(); // Start the app
