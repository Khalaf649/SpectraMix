import ImageViewPort from "./ImageViewPort";
function OutputViewPorts({
  outputs,
  selectedOutput,
  setSelectedOutput,
  unifiedSize,
}) {
  return (
    <div className="ft-mixer-output-column">
      {[1, 2].map((id) => {
        return (
          <ImageViewPort
            key={id}
            id={id}
            title={`Output ${id}`}
            outputImage={outputs[id - 1].image}
            ftMagnitude={outputs[id - 1].ftMagnitude}
            ftPhase={outputs[id - 1].ftPhase}
            ftReal={outputs[id - 1].ftReal}
            ftImaginary={outputs[id - 1].ftImaginary}
            width={outputs[id - 1].width}
            height={outputs[id - 1].height}
            isSelected={selectedOutput === id}
            onSelect={setSelectedOutput}
            displaySize={unifiedSize.width > 0 ? unifiedSize : undefined}
            isOutput={true}
          />
        );
      })}
    </div>
  );
}
export default OutputViewPorts;
