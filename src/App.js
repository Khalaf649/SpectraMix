import Header from "./components/header";
import FTMixer from "./components/FTMixter";
function App() {
  return (
    <div className="App">
      <Header />
      <main style={{ flex: 1, overflow: "hidden" }}>
        <div className="content-wrapper">
          <FTMixer />
        </div>
      </main>
    </div>
  );
}

export default App;
