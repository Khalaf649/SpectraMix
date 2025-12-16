function SelectBox({
  options = [],
  value = "",
  onChange = () => {},
  className = "",
}) {
  const safeValue = options.includes(value) ? value : options[0] || "";

  return (
    <select
      aria-label="Select option"
      className={`select-trigger ${className} select-content select-scroll-btn`}
      value={safeValue}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt} className="select-item" value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export default SelectBox;
