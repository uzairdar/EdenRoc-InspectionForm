function CenturionRadTaperPanel({ manufacturerDetails, handleManufacturerDetail, disabled = false }) {
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
    <div className="centurion-taper-panel">
      <p className="centurion-taper-instructions">
        On a roller door a tapered plate is fitted to the bottom of the door.
        <br />
        The minimum size of the taper is 40mm.
        <br />
        Add the taper measurement required.
        <br />
        I.e. for a 50 mm RH taper on a roller door the tapered plate will be 40mm to 90mm.
      </p>

      <div className="centurion-taper-row">
        <input
          className="centurion-taper-measure"
          type="text"
          inputMode="numeric"
          placeholder="mm"
          value={manufacturerDetails.lhTaperVilo || ''}
          onChange={handleMeasureInput('lhTaperVilo')}
          disabled={disabled}
        />

        <div className="centurion-taper-shape lh">
          <div className="centurion-taper-label">LH Taper VILO</div>
        </div>

        <div className="centurion-taper-fixed">40mm</div>
      </div>

      <div className="centurion-taper-row">
        <div className="centurion-taper-fixed">40mm</div>

        <div className="centurion-taper-shape rh">
          <div className="centurion-taper-label">RH Taper VILO</div>
        </div>

        <input
          className="centurion-taper-measure"
          type="text"
          inputMode="numeric"
          placeholder="mm"
          value={manufacturerDetails.rhTaperVilo || ''}
          onChange={handleMeasureInput('rhTaperVilo')}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export default CenturionRadTaperPanel
