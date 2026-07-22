import FormField from './FormField'

function SteelineViloTaperPanel({ manufacturerDetails, handleManufacturerDetail, disabled = false }) {
  const handleMeasureInput = (fieldName) => (event) => {
    const numericValue = event.target.value.replace(/[^0-9]/g, '')
    handleManufacturerDetail({
      target: {
        name: fieldName,
        value: numericValue,
      },
    })
  }

  return (
    <div className="steeline-vilo-taper-panel">
      <div className="steeline-vilo-taper-panel__header">
        <p className="steeline-vilo-taper-panel__title">Select whether the taper is LHS Vilo or RHS Vilo.</p>
        <p className="steeline-vilo-taper-panel__note">Then enter the LH and RH taper vilo measurements below.</p>
      </div>

      <div className="steeline-vilo-taper-panel__grid">
        <FormField
          name="taperViloSide"
          label="Taper Vilo Side"
          type="select"
          options={['LHS Vilo', 'RHS Vilo']}
          value={manufacturerDetails.taperViloSide || ''}
          onChange={handleManufacturerDetail}
          disabled={disabled}
        />

        <FormField
          name="lhTaperVilo"
          label="LH Taper Vilo"
          type="number"
          value={manufacturerDetails.lhTaperVilo || ''}
          onChange={handleMeasureInput('lhTaperVilo')}
          disabled={disabled}
        />

        <FormField
          name="rhTaperVilo"
          label="RH Taper Vilo"
          type="number"
          value={manufacturerDetails.rhTaperVilo || ''}
          onChange={handleMeasureInput('rhTaperVilo')}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export default SteelineViloTaperPanel