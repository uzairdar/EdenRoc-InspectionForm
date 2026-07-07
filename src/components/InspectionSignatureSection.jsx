import FormCard from './FormCard'
import SignatureField from './SignatureField'

export default function InspectionSignatureSection({ formData, setFormData, isReadOnly }) {
  return (
    <FormCard
      title="Customer Review & Signature"
      subtitle="Please ask the customer to review all details and sign before final submission."
    >
      <div className="signature-block">
        <label className="review-checkbox">
          <input
            type="checkbox"
            checked={Boolean(formData.customerReviewed)}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                customerReviewed: event.target.checked,
              }))
            }
            disabled={isReadOnly}
          />
          <span>I confirm the customer has reviewed and approved the details above.</span>
        </label>

        <SignatureField
          value={formData.customerSignature || ''}
          onChange={(signatureData) =>
            setFormData((prev) => ({
              ...prev,
              customerSignature: signatureData,
            }))
          }
          disabled={isReadOnly}
        />
      </div>
    </FormCard>
  )
}
