function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  options = [],
  placeholder = '',
  note = '',
  hint = '',
  rows = 4,
  className = '',
  disabled = false,
}) {
  const id = `field-${name}`

  return (
    <div className={`form-field ${className}`}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
        />
      ) : type === 'select' ? (
        <select id={id} name={name} value={value} onChange={onChange} disabled={disabled}>
          <option value="">Choose...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          min={type === 'number' ? 0 : undefined}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {note ? <div className="field-note">{note}</div> : null}
      {hint ? <div className="field-hint">{hint}</div> : null}
    </div>
  )
}

export default FormField
