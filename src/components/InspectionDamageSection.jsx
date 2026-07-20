import FormCard from './FormCard'
import FormField from './FormField'
import MeasurementSketchField from './MeasurementSketchField'

export default function InspectionDamageSection({
  damageFields,
  tapperFields,
  damageNotesFields,
  openingFields,
  clearanceFields,
  heightSurveyFields,
  tableFields,
  formData,
  handleChange,
  setFormData,
  isReadOnly,
}) {
  return (
    <>
      <FormCard title="Damage Details" subtitle="Existing door damage">
        <div className="form-grid">
          {damageFields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          ))}
        </div>

        <div className="form-grid compact-grid">
          {tapperFields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          ))}
        </div>

        <div className="section-subhead">
          <h3>Additional damage details</h3>
        </div>
        <div className="form-grid">
          {damageNotesFields.map((field) => (
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

      <FormCard title="Window Style" subtitle="Describe or note window style details">
        <FormField
          name="windowNotes"
          label="Window notes"
          type="textarea"
          value={formData.windowNotes}
          onChange={handleChange}
          placeholder="Add any window style details here"
          rows={4}
        />
      </FormCard>

      <FormCard title="Flashings" subtitle="Flashing requirements for this installation">
        <FormField
          name="flashingNotes"
          label="Flashing notes"
          type="textarea"
          value={formData.flashingNotes}
          onChange={handleChange}
          placeholder="Add flashing requirements"
          rows={4}
        />
      </FormCard>

      <FormCard title="Opening Measurements" subtitle="All dimensions in millimetres (mm)">
        <div className="section-subhead">
          <h3>Opening</h3>
        </div>
        <div className="form-grid">
          {openingFields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          ))}
        </div>

        <div className="section-subhead">
          <h3>Clearance</h3>
        </div>
        <div className="form-grid">
          {clearanceFields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          ))}
        </div>

        <div className="section-subhead">
          <h3>Height survey</h3>
        </div>
        <div className="form-grid">
          {heightSurveyFields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          ))}
        </div>

        <div className="section-subhead">
          <h3>Measurement table</h3>
        </div>
        <div className="table-grid measurement-grid">
          {tableFields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          ))}
        </div>

        <div className="section-subhead">
          <h3>Drawing / layout sketch</h3>
        </div>
        <MeasurementSketchField
          value={formData.measurementSketch || ''}
          onChange={(sketchData) =>
            setFormData((prev) => ({
              ...prev,
              measurementSketch: sketchData,
            }))
          }
          disabled={isReadOnly}
        />
      </FormCard>
    </>
  )
}
