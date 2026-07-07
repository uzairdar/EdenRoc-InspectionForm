import AddressSearch from './AddressSearch'
import FormCard from './FormCard'
import FormField from './FormField'

export default function InspectionCustomerSection({
  customerFields,
  formData,
  isReadOnly,
  handleChange,
  setFormData,
}) {
  return (
    <FormCard title="Customer Details" subtitle="Primary contact information">
      <div className="form-grid">
        {customerFields.map((field) => {
          if (field.name === 'address') {
            return (
              <div key={field.name} className="form-field">
                <label className="field-label">{field.label}</label>
                <AddressSearch
                  value={formData.address.replace(/\n/g, ', ')}
                  onChange={(addressValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: addressValue,
                    }))
                  }
                  placeholder="Search address..."
                  disabled={isReadOnly}
                />
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
    </FormCard>
  )
}
