import FormCard from './FormCard'
import FormField from './FormField'
import Loader from './Loader'

export default function InspectionJobSection({
  jobFields,
  formData,
  isReadOnly,
  handleChange,
  fetchServiceM8Details,
  serviceM8Loading,
  serviceM8Error,
}) {
  return (
    <FormCard title="Job Details" subtitle="Order assignment and status">
      <div className="form-grid">
        {jobFields.map((field) => {
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
