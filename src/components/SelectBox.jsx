function SelectBox({ options, value, onChange }) {
  return (
    <select
      className="select-trigger select-trigger-ft select-content select-scroll-btn"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option className="select-item" key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
export default SelectBox;
