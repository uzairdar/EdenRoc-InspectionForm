import FormCard from './FormCard'
import FormField from './FormField'
import CenturionRadTaperPanel from './CenturionRadTaperPanel'
import SteelineViloTaperPanel from './SteelineViloTaperPanel'
import { Fragment } from 'react'
import { steelineWindowTypeOptions } from '../formConfig'

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
  const isCenturionRad = selectedManufacturer === 'Centurion RAD'
  const isCenturionSectional = selectedManufacturer === 'Centurion Sectional'
  const centurionSectionalTaperRequired = manufacturerDetails.taperRequired || ''
  const isSteeline = selectedManufacturer === 'Steeline Sectional' || selectedManufacturer === 'Steeline RAD'
  const steelineStyle = manufacturerDetails.style || ''
  const steelineWindowOptions = isSteeline ? steelineWindowTypeOptions[steelineStyle] || [] : []
  const showSteelineViloTaperPanel = isSteeline && (manufacturerDetails.taperVilo === 'Yes' || manufacturerDetails.taperVilo === 'Y')

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
                const fieldValue = manufacturerDetails[field.name] || ''
                const fieldOptions = field.name === 'windowType' ? steelineWindowOptions : field.options
                const hideCenturionSectionalTaperHeights =
                  isCenturionSectional &&
                  (field.name === 'lhsHight' || field.name === 'rhsHight') &&
                  centurionSectionalTaperRequired !== 'Yes' &&
                  centurionSectionalTaperRequired !== 'Y'
                const showTaperPanel =
                  isCenturionRad &&
                  field.name === 'taperRequired' &&
                  (fieldValue === 'Yes' || fieldValue === 'Y')
                const showSteelineViloTaper = field.name === 'taperVilo' && showSteelineViloTaperPanel
                const hideSteelineWindowType = field.name === 'windowType' && (!isSteeline || fieldOptions.length === 0)

                if (hideCenturionSectionalTaperHeights || hideSteelineWindowType) {
                  return null
                }

                return (
                  <Fragment key={field.name}>
                    <div className="form-field-group">
                      <FormField
                        {...field}
                        options={fieldOptions}
                        value={fieldValue}
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
                    {showTaperPanel ? (
                      <div className="centurion-taper-panel-row">
                        <CenturionRadTaperPanel
                          manufacturerDetails={manufacturerDetails}
                          handleManufacturerDetail={handleManufacturerDetail}
                          disabled={isReadOnly}
                        />
                      </div>
                    ) : null}
                    {showSteelineViloTaper ? (
                      <div className="steeline-vilo-taper-panel-row">
                        <SteelineViloTaperPanel
                          manufacturerDetails={manufacturerDetails}
                          handleManufacturerDetail={handleManufacturerDetail}
                          disabled={isReadOnly}
                        />
                      </div>
                    ) : null}
                  </Fragment>
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
