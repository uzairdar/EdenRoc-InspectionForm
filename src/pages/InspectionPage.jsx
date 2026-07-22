import { useEffect, useRef, useState } from 'react'
import '../App.css'
import Loader from '../components/Loader'
import InspectionCustomerSection from '../components/InspectionCustomerSection'
import InspectionVersionHistorySection from '../components/InspectionVersionHistorySection'
import InspectionDamageSection from '../components/InspectionDamageSection'
import InspectionMaterialsSection from '../components/InspectionMaterialsSection'
import InspectionSignatureSection from '../components/InspectionSignatureSection'
import {
  initialForm,
  customerFields,
  jobFields,
  damageFields,
  taperFields,
  damageNotesFields,
  openingFields,
  clearanceFields,
  heightSurveyFields,
  tableFields,
  materialFields,
  g4Fields,
  manufacturerConfigs,
} from '../constants/formSchema'
import { navigateToHash } from '../utils/navigation'
import { formatVersionStamp, normalizeDateInput } from '../utils/inspection'
import { downloadCenturionRadOrderTemplate } from '../utils/centurionRadTemplate'
import { downloadCenturionSectionalOrderTemplate } from '../utils/centurionSectionalTemplate'
import { downloadSteelineOrderTemplate } from '../utils/steelineTemplate'
import { mapServiceM8ToForm } from '../utils/servicem8Mapper'
import {
  fetchInspectionByIdentifier,
  fetchServiceM8JobByNumber,
  fetchServiceM8JobByUuid,
  submitInspection,
} from '../services/inspectionsApi'

const isUuidLike = (value) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(String(value || '').trim())

const centurionRadDefaults = {
  taperRequired: 'No',
  keyedAlike: 'No',
  oversizeWeatherSeal: 'No',
  windLock: 'No',
  steelWrapForTransport: 'No',
}

const centurionSectionalDefaults = {
  taperRequired: 'No',
  panelsOnly: 'No',
  fitThermoGuardInsulation: 'No',
  windStrutsOnAllPanels: 'No',
  oversizeWeatherSeal: 'No',
  steelWrapForTransport: 'No',
}

const steelineDefaults = {
  keyedAlike: 'No',
  keyedDifferent: 'No',
  shootBolts: 'No',
  taperVilo: 'No',
  notched: 'No',
  steelWrapForTransport: 'No',
  packForTransport: 'No',
}

const applyManufacturerDefaults = (manufacturer, details = {}) => {
  if (manufacturer === 'Centurion RAD') {
    return {
      ...centurionRadDefaults,
      ...(details || {}),
    }
  }

  if (manufacturer === 'Centurion Sectional') {
    return {
      ...centurionSectionalDefaults,
      ...(details || {}),
    }
  }

  if (manufacturer === 'Steeline Sectional' || manufacturer === 'Steeline RAD') {
    return {
      ...steelineDefaults,
      ...(details || {}),
    }
  }

  return details || {}
}

export default function InspectionPage() {
  const [formData, setFormData] = useState(initialForm)
  const [manufacturerDetails, setManufacturerDetails] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [editInspectionId, setEditInspectionId] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [serviceM8Loading, setServiceM8Loading] = useState(false)
  const [serviceM8Error, setServiceM8Error] = useState(null)
  const [templateLoading, setTemplateLoading] = useState(false)
  const [versionHistory, setVersionHistory] = useState([])
  const [inspectionSource, setInspectionSource] = useState(null)
  const [verifiedServiceM8JobNumber, setVerifiedServiceM8JobNumber] = useState('')
  const [loadedJobNumber, setLoadedJobNumber] = useState('')
  const submitLockRef = useRef(false)
  const isBusy = loading || serviceM8Loading

  const loaderTitle = serviceM8Loading
    ? 'Connecting to ServiceM8'
    : loading
      ? isEditMode
        ? 'Saving inspection'
        : editInspectionId
          ? 'Loading inspection'
          : 'Working'
      : 'Working'

  const loaderDescription = serviceM8Loading
    ? 'Fetching job details and contact data.'
    : loading
      ? isEditMode
        ? 'Please stay on this page while the record is being updated.'
        : editInspectionId
          ? 'Loading inspection data and version history.'
          : 'Please wait while the request completes.'
      : 'Please wait while the request completes.'

  const goBackToDashboard = () => {
    navigateToHash('#/')
  }

  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash || '#/new'
      if (hash.startsWith('#/edit/')) {
        const id = hash.replace('#/edit/', '')
        if (id) {
          setEditInspectionId(id)
          setIsEditMode(true)
          setIsViewMode(false)
          return
        }
      }
      if (hash.startsWith('#/view/')) {
        const id = hash.replace('#/view/', '')
        if (id) {
          setEditInspectionId(id)
          setIsEditMode(false)
          setIsViewMode(true)
          return
        }
      }
      setEditInspectionId(null)
      setIsEditMode(false)
      setIsViewMode(false)
      setFormData(initialForm)
      setManufacturerDetails({})
      setVersionHistory([])
      setSuccessMessage(null)
      setSubmitted(false)
      setInspectionSource(null)
      setVerifiedServiceM8JobNumber('')
      setLoadedJobNumber('')
    }

    parseHash()
    window.addEventListener('hashchange', parseHash)
    return () => window.removeEventListener('hashchange', parseHash)
  }, [])

  useEffect(() => {
    const applyServiceM8JobToForm = (job) => {
      const mapped = mapServiceM8ToForm(job)
      const normalizedMappedJobNumber = String(mapped.jobNumber || '').trim()
      setFormData((prev) => ({
        ...prev,
        ...mapped,
        job_uuid: mapped.job_uuid || prev.job_uuid,
      }))
      setManufacturerDetails(applyManufacturerDefaults(mapped.manufacturer, {}))
      setVersionHistory([])
      setInspectionSource('servicem8')
      setVerifiedServiceM8JobNumber(normalizedMappedJobNumber)
      setLoadedJobNumber(normalizedMappedJobNumber)
      setSuccessMessage('Loaded job details from ServiceM8.')
      setSubmitted(false)
    }

    const loadInspection = async (id) => {
      if (!id) return
      setLoading(true)
      setError(null)
      setServiceM8Error(null)
      try {
        const result = await fetchInspectionByIdentifier(id)
        const { _id, __v, createdAt, updatedAt, ...inspectionData } = result.data || {}
        setFormData({
          ...initialForm,
          ...inspectionData,
          date: normalizeDateInput(inspectionData.date),
        })
        setVersionHistory(result.versions || (result.data ? [result.data] : []))
        setManufacturerDetails(applyManufacturerDefaults(inspectionData.manufacturer, result.data.manufacturerDetails || {}))
        setInspectionSource('database')
        setLoadedJobNumber(String(inspectionData.jobNumber || '').trim())
        setVerifiedServiceM8JobNumber('')
        setSuccessMessage(null)
        setSubmitted(false)
      } catch (err) {
        throw err
      } finally {
        setLoading(false)
      }
    }

    const loadByRoute = async () => {
      if (!((isEditMode || isViewMode) && editInspectionId)) {
        return
      }

      const uuidLike = isUuidLike(editInspectionId)

      if (uuidLike) {
        setLoading(true)
        setError(null)
        setServiceM8Error(null)

        try {
          const result = await fetchInspectionByIdentifier(editInspectionId)
          if (result?.success) {
            const { _id, __v, createdAt, updatedAt, ...inspectionData } = result.data || {}
            setFormData({
              ...initialForm,
              ...inspectionData,
              date: normalizeDateInput(inspectionData.date),
            })
            setVersionHistory(result.versions || (result.data ? [result.data] : []))
            setManufacturerDetails(applyManufacturerDefaults(inspectionData.manufacturer, result.data.manufacturerDetails || {}))
            setInspectionSource('database')
            setLoadedJobNumber(String(inspectionData.jobNumber || '').trim())
            setVerifiedServiceM8JobNumber('')
            setSuccessMessage(null)
            setSubmitted(false)
            return
          }

          const serviceJobResult = await fetchServiceM8JobByUuid(editInspectionId)
          const serviceJob = serviceJobResult?.data
          if (serviceJob) {
            applyServiceM8JobToForm(serviceJob)
            return
          }

          setError('No inspection record or ServiceM8 job was found for this UUID.')
        } catch (err) {
          if (err.message === 'Inspection not found') {
            try {
              const serviceJobResult = await fetchServiceM8JobByUuid(editInspectionId)
              const serviceJob = serviceJobResult?.data
              if (serviceJob) {
                applyServiceM8JobToForm(serviceJob)
                return
              }
            } catch {
              // Fallback message is handled below.
            }
          }
          setError(err.message || 'Failed to load inspection')
        } finally {
          setLoading(false)
        }

        return
      }

      try {
        await loadInspection(editInspectionId)
      } catch (err) {
        setError(err.message || 'Failed to load inspection')
      }
    }

    loadByRoute()
    return undefined
  }, [editInspectionId, isEditMode, isViewMode])

  const handleChange = (event) => {
    if (isViewMode) return
    const { name, value } = event.target
    if (name === 'jobNumber') {
      const normalizedValue = String(value || '').trim()
      if (normalizedValue !== verifiedServiceM8JobNumber) {
        setVerifiedServiceM8JobNumber('')
      }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'manufacturer' ? { manufacturer: value } : {}),
    }))

    if (name === 'manufacturer') {
      setManufacturerDetails(applyManufacturerDefaults(value, {}))
      setSubmitted(false)
    }
    setError(null)
  }

  const handleManufacturerDetail = (event) => {
    if (isViewMode) return
    const { name, value } = event.target
    setManufacturerDetails((prev) => ({ ...prev, [name]: value }))
    setSubmitted(false)
    setError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isViewMode) {
      return
    }

    if (submitLockRef.current || loading) {
      return
    }

    const normalizedJobNumber = (formData.jobNumber || '').trim()
    if (!normalizedJobNumber) {
      setError('Job Number is required before saving inspection data.')
      setSuccessMessage(null)
      return
    }

    const isDatabaseEdit = isEditMode && inspectionSource === 'database'
    const requiresServiceM8Verification = !isDatabaseEdit || normalizedJobNumber !== loadedJobNumber
    const isServiceM8Verified = normalizedJobNumber === verifiedServiceM8JobNumber

    if (requiresServiceM8Verification && !isServiceM8Verified) {
      setError('Please fetch details and confirm a valid ServiceM8 job number before saving.')
      setSuccessMessage(null)
      return
    }

    if (!formData.customerReviewed) {
      setError('Please confirm the customer has reviewed all details before submitting.')
      setSuccessMessage(null)
      return
    }

    if (!formData.customerSignature) {
      setError('Customer signature is required before submitting the form.')
      setSuccessMessage(null)
      return
    }

    submitLockRef.current = true
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const dataToSubmit = {
        ...formData,
        jobNumber: normalizedJobNumber,
        manufacturerDetails,
      }

      const shouldUpdateExistingRecord = isEditMode && editInspectionId && inspectionSource === 'database'
      const identifier = shouldUpdateExistingRecord ? editInspectionId : null

      const result = await submitInspection({
        identifier,
        data: dataToSubmit,
        isUpdate: shouldUpdateExistingRecord,
      })

      console.log('Form submitted successfully:', result)
      setSubmitted(true)
      setSuccessMessage(shouldUpdateExistingRecord ? 'Inspection record updated successfully!' : 'Inspection record saved successfully!')
      navigateToHash('#/')
    } catch (err) {
      console.error('Error submitting form:', err)
      setError(err.message || 'Failed to save inspection record')
      setSubmitted(false)
    } finally {
      setLoading(false)
      submitLockRef.current = false
    }
  }

  const selectedManufacturer = formData.manufacturer
  const selectedConfig = manufacturerConfigs[selectedManufacturer] || []
  const isReadOnly = isViewMode

  const hasCustomOption = (field) =>
    field?.type === 'select' && Array.isArray(field.options) && field.options.some((option) => String(option).toLowerCase() === 'custom')

  const isCustomSelected = (fieldName) => String(manufacturerDetails[fieldName] || '').toLowerCase() === 'custom'

  const getCustomValueKey = (fieldName) => `${fieldName}CustomValue`
  const activeVersion =
    versionHistory.find((version) => version._id === editInspectionId) ||
    (isUuidLike(editInspectionId)
      ? versionHistory.find((version) => version.isCurrent) || versionHistory[0] || null
      : null)
  const activeVersionId = activeVersion?._id || null
  const showEditInspectionAction = isViewMode && Boolean(editInspectionId)
  const isCenturionRad = selectedManufacturer === 'Centurion RAD'
  const isCenturionSectional = selectedManufacturer === 'Centurion Sectional'
  const isSteeline = selectedManufacturer === 'Steeline Sectional' || selectedManufacturer === 'Steeline RAD'

  const openVersion = (versionId, mode = 'view') => {
    if (!versionId) return
    navigateToHash(`#/${mode}/${versionId}`)
  }

  const fetchServiceM8Details = async () => {
    if (!formData.jobNumber?.trim()) {
      setServiceM8Error('Please enter a job number first.')
      setVerifiedServiceM8JobNumber('')
      return
    }

    setServiceM8Loading(true)
    setServiceM8Error(null)

    try {
      const normalizedInputJobNumber = String(formData.jobNumber || '').trim()
      const result = await fetchServiceM8JobByNumber(normalizedInputJobNumber)
      if (!result?.data) {
        setServiceM8Error('No ServiceM8 job found for this job number.')
        setVerifiedServiceM8JobNumber('')
        return
      }
      const mapped = mapServiceM8ToForm(result.data)
      const normalizedMappedJobNumber = String(mapped.jobNumber || normalizedInputJobNumber).trim()
      setFormData((prev) => ({
        ...prev,
        ...mapped,
      }))
      setInspectionSource('servicem8')
      setVerifiedServiceM8JobNumber(normalizedMappedJobNumber)
      setLoadedJobNumber(normalizedMappedJobNumber)
    } catch (err) {
      setServiceM8Error(err.message || 'ServiceM8 lookup failed')
      setVerifiedServiceM8JobNumber('')
    } finally {
      setServiceM8Loading(false)
    }
  }

  const normalizedCurrentJobNumber = String(formData.jobNumber || '').trim()
  const isDatabaseEdit = isEditMode && inspectionSource === 'database'
  const requiresServiceM8Verification = !isDatabaseEdit || normalizedCurrentJobNumber !== loadedJobNumber
  const isServiceM8Verified = normalizedCurrentJobNumber === verifiedServiceM8JobNumber
  const canSubmitInspection = Boolean(normalizedCurrentJobNumber) && (!requiresServiceM8Verification || isServiceM8Verified)

  const handleDownloadCenturionRadTemplate = async () => {
    if (!isCenturionRad) return

    setTemplateLoading(true)
    setError(null)

    try {
      await downloadCenturionRadOrderTemplate({
        manufacturerDetails,
        jobNumber: formData.jobNumber,
      })
    } catch (err) {
      setError(err.message || 'Failed to prepare Centurion RAD template download.')
    } finally {
      setTemplateLoading(false)
    }
  }

  const handleDownloadCenturionSectionalTemplate = async () => {
    if (!isCenturionSectional) return

    setTemplateLoading(true)
    setError(null)

    try {
      await downloadCenturionSectionalOrderTemplate({
        manufacturerDetails,
        jobNumber: formData.jobNumber,
      })
    } catch (err) {
      setError(err.message || 'Failed to prepare Centurion sectional template download.')
    } finally {
      setTemplateLoading(false)
    }
  }

  const handleDownloadSteelineTemplate = async () => {
    if (!isSteeline) return

    setTemplateLoading(true)
    setError(null)

    try {
      await downloadSteelineOrderTemplate({
        manufacturerDetails,
        jobNumber: formData.jobNumber,
      })
    } catch (err) {
      setError(err.message || 'Failed to prepare Steeline template download.')
    } finally {
      setTemplateLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <span className="eyebrow">Field service inspector</span>
          <h1>Garage door inspection form</h1>
          <p className="hero-copy">
            Complete the customer, job, damage and materials details in a polished
            workflow designed for speed and accuracy.
          </p>
          {activeVersion ? (
            <div className="version-summary">
              <span className="version-pill">Version {activeVersion.versionNumber || 1}</span>
              <span className="field-note">
                {activeVersion.isCurrent ? 'Current version' : 'Historic version'} - Created {formatVersionStamp(activeVersion.createdAt)}
              </span>
            </div>
          ) : null}
        </div>
        <div className="header-action-group">
          {isCenturionRad ? (
            <button
              type="button"
              className="modal-secondary"
              onClick={handleDownloadCenturionRadTemplate}
              disabled={templateLoading}
            >
              {templateLoading ? 'Preparing order template...' : 'Download Centurion RAD order'}
            </button>
          ) : null}
          {isCenturionSectional ? (
            <button
              type="button"
              className="modal-secondary"
              onClick={handleDownloadCenturionSectionalTemplate}
              disabled={templateLoading}
            >
              {templateLoading ? 'Preparing order template...' : 'Download Centurion Sectional order'}
            </button>
          ) : null}
          {isSteeline ? (
            <button
              type="button"
              className="modal-secondary"
              onClick={handleDownloadSteelineTemplate}
              disabled={templateLoading}
            >
              {templateLoading ? 'Preparing order template...' : 'Download Steeline order'}
            </button>
          ) : null}
          <button type="button" className="modal-secondary" onClick={goBackToDashboard}>
            Back to dashboard
          </button>
          {showEditInspectionAction ? (
            <button
              type="button"
              className="form-submit"
              onClick={() => navigateToHash(`#/edit/${editInspectionId}`)}
              disabled={loading}
            >
              {inspectionSource === 'servicem8' ? 'Edit details' : 'Edit inspection'}
            </button>
          ) : null}
        </div>
      </header>

      <form className="form-layout" onSubmit={handleSubmit}>
        <InspectionCustomerSection
          customerFields={customerFields}
          jobFields={jobFields}
          formData={formData}
          isReadOnly={isReadOnly}
          handleChange={handleChange}
          setFormData={setFormData}
          fetchServiceM8Details={fetchServiceM8Details}
          serviceM8Loading={serviceM8Loading}
          serviceM8Error={serviceM8Error}
        />

        <InspectionVersionHistorySection
          versionHistory={versionHistory}
          activeVersionId={activeVersionId}
          formatVersionStamp={formatVersionStamp}
          openVersion={openVersion}
        />

        <InspectionDamageSection
          damageFields={damageFields}
          taperFields={taperFields}
          damageNotesFields={damageNotesFields}
          openingFields={openingFields}
          clearanceFields={clearanceFields}
          heightSurveyFields={heightSurveyFields}
          tableFields={tableFields}
          formData={formData}
          handleChange={handleChange}
          setFormData={setFormData}
          isReadOnly={isReadOnly}
        />

        <InspectionMaterialsSection
          materialFields={materialFields}
          g4Fields={g4Fields}
          formData={formData}
          handleChange={handleChange}
          isReadOnly={isReadOnly}
          selectedManufacturer={selectedManufacturer}
          selectedConfig={selectedConfig}
          manufacturerDetails={manufacturerDetails}
          handleManufacturerDetail={handleManufacturerDetail}
          hasCustomOption={hasCustomOption}
          isCustomSelected={isCustomSelected}
          getCustomValueKey={getCustomValueKey}
        />

        <InspectionSignatureSection
          formData={formData}
          setFormData={setFormData}
          isReadOnly={isReadOnly}
        />

        {!isViewMode ? (
          <div className="form-actions">
            <button type="submit" className="form-submit" disabled={loading || !canSubmitInspection}>
              {loading ? <Loader variant="button" title="Saving" /> : 'Save inspection data'}
            </button>
          </div>
        ) : (
          <div className="form-actions">
            <p className="field-note">This is a read-only inspection view. Use Edit to change records.</p>
          </div>
        )}
      </form>

      {error ? (
        <section className="summary-card alert-card is-error">
          <h2>Error</h2>
          <p>{error}</p>
        </section>
      ) : null}

      {successMessage ? (
        <section className="summary-card alert-card is-success">
          <h2>Success</h2>
          <p>{successMessage}</p>
        </section>
      ) : null}

      {isBusy ? (
        <Loader
          variant="overlay"
          title={loaderTitle}
          description={loaderDescription}
        />
      ) : null}

      {submitted ? (
        <section className="summary-card">
          <h2>Saved data preview</h2>
          <p>The form values are maintained in React state for every field.</p>
          <pre>{JSON.stringify({ ...formData, manufacturerDetails }, null, 2)}</pre>
        </section>
      ) : null}
    </main>
  )
}
