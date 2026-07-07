import FormCard from './FormCard'
import FormField from './FormField'

export default function InspectionMaterialsSection({
  materialFields,
  g4Fields,
  formData,
  handleChange,
  isReadOnly,
  selectedManufacturer,
  selectedConfig,
  manufacturerDetails,
  handleManufacturerDetail,
  hasCustomOption,
  isCustomSelected,
  getCustomValueKey,
}) {
  return (
    <>
      <FormCard title="Materials Required for the Job" subtitle="New door - select manufacturer first to load options">
        <div className="form-grid">
          {materialFields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          ))}
        </div>

        {selectedManufacturer ? (
          <div className="manufacturer-card">
            <p className="manufacturer-note">
              Custom options for <strong>{selectedManufacturer}</strong>.
            </p>
            <div className="form-grid">
              {selectedConfig.map((field) => {
                const customValueKey = getCustomValueKey(field.name)
                const showCustomInput = hasCustomOption(field) && isCustomSelected(field.name)

                return (
                  <div key={field.name} className="form-field-group">
                    <FormField
                      {...field}
                      value={manufacturerDetails[field.name] || ''}
                      onChange={handleManufacturerDetail}
                      disabled={isReadOnly}
                    />
                    {showCustomInput ? (
                      <FormField
                        label={`${field.label} (Custom value)`}
                        name={customValueKey}
                        type="text"
                        value={manufacturerDetails[customValueKey] || ''}
                        onChange={handleManufacturerDetail}
                        placeholder={`Enter custom ${field.label.toLowerCase()}`}
                        disabled={isReadOnly}
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </FormCard>

      <FormCard title="Other" subtitle="Additional project details">
        <FormField
          name="installerNotes"
          label="Additional notes for installer"
          type="textarea"
          value={formData.installerNotes}
          onChange={handleChange}
          placeholder="Enter notes for the installer"
          rows={4}
          disabled={isReadOnly}
        />
      </FormCard>

      <FormCard title="For G4 Doors Especially" subtitle="Special checks for G4 installations">
        <div className="form-grid">
          {g4Fields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          ))}
        </div>
      </FormCard>
    </>
  )
}
