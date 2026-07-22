import FormCard from './FormCard'
import FormField from './FormField'
import Loader from './Loader'

export default function InspectionCustomerSection({
  customerFields,
  jobFields,
  formData,
  isReadOnly,
  handleChange,
  setFormData,
  fetchServiceM8Details,
  serviceM8Loading,
  serviceM8Error,
}) {
  const mergedFields = [...customerFields, ...jobFields]

  return (
    <FormCard title="Customer and Job Details" subtitle="Essential contact and assignment information">
      <div className="form-grid">
        {mergedFields.map((field) => {
          if (field.name === 'address') {
            return (
              <FormField
                key={field.name}
                {...field}
                value={String(formData.address || '').replace(/\n/g, ', ')}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: event.target.value,
                  }))
                }
                disabled={isReadOnly}
              />
            )
          }
          if (field.name === 'jobNumber') {
            return (
              <div key={field.name} className="form-field fetch-field-wrapper">
                <FormField
                  {...field}
                  value={formData[field.name]}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
                {!isReadOnly ? (
                  <button
                    type="button"
                    className="modal-secondary fetch-details-btn"
                    onClick={fetchServiceM8Details}
                    disabled={serviceM8Loading}
                  >
                    {serviceM8Loading ? <Loader variant="button" title="Fetching" /> : 'Fetch details'}
                  </button>
                ) : null}
              </div>
            )
          }
          return (
            <FormField
              key={field.name}
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          )
        })}
      </div>
      {(serviceM8Loading || serviceM8Error) && (
        <div className={`field-note service-status-note ${serviceM8Error ? 'is-error' : ''}`}>
          {serviceM8Loading ? 'Looking up job in ServiceM8...' : serviceM8Error}
        </div>
      )}
    </FormCard>
  )
}
