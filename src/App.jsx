import { useEffect, useRef, useState } from 'react'
import './App.css'
import AddressSearch from './components/AddressSearch'
import {
  jobStatusOptions,
  yesNoOptions,
  standardFinish,
  standardTaper,
  standardHardware,
  standardMotor,
  standardJambs,
  standardCovers,
  standardPelmet,
  standardBrushSeals,
  standardEkr,
  standardInsulation,
  bdmStyle,
  bdSectionalStyle,
  csiSectionalStyle,
  bdRadDomesticStyle,
  bdRadIndustrialStyle,
  centurionSectionalStyle,
  centurionRadStyle,
  centurionBRadStyle,
  steelineSectionalStyle,
  steelineRadStyle,
  danmarCustomStyle,
  metrolRadStyle,
  centurionColours,
  standardColours,
  bdmColours,
  danmarColours,
  steelineTimberlooks,
  danmarTimberlooks,
  materialManufacturers,
  manufacturerConfigs,
} from './formConfig'
import FormCard from './components/FormCard'
import FormField from './components/FormField'

const initialForm = {
  customerName: '',
  tenantName: '',
  customerMobile: '',
  tenantMobile: '',
  email: '',
  address: '',
  jobNumber: '',
  job_uuid: '',
  date: '',
  staffName: '',
  jobStatus: 'Quote',
  doorType: '',
  doorBrand: '',
  doorStyle: '',
  doorColour: '',
  panelSize: '',
  radSizeTotal: '',
  bottom: '',
  firstUp: '',
  second: '',
  third: '',
  topPanel: '',
  windowStyle: '',
  centreLock: '',
  motorBrand: '',
  motorCondition: '',
  pelmet: '',
  jambs: '',
  covers: '',
  powerPointGarage: '',
  backClear: '',
  recess: '',
  accessProperty: '',
  taper: '',
  vilo: '',
  windowNotes: '',
  flashingNotes: '',
  openingWidth: '',
  openingHeight: '',
  leftSideroom: '',
  rightSideroom: '',
  headroom: '',
  heightLHS: '',
  heightRHS: '',
  lhsDth: '',
  centreDth: '',
  rhsDth: '',
  depositPaid: 'No',
  customerConfirmed: 'No',
  manufacturer: '',
  windows: '',
  installerNotes: '',
  lightsMoved: 'No',
  chainDrive: 'No',
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function App() {
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
  const [versionHistory, setVersionHistory] = useState([])
  const submitLockRef = useRef(false)

  const navigateToHash = (hash) => {
    window.history.pushState(null, '', hash)
    window.dispatchEvent(new Event('hashchange'))
  }

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
    }

    parseHash()
    window.addEventListener('hashchange', parseHash)
    return () => window.removeEventListener('hashchange', parseHash)
  }, [])

  useEffect(() => {
    const normalizeDate = (value) => {
      if (!value) return ''
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
    }

    const loadInspection = async (id) => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/inspections/${id}`)
        const result = await response.json()
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to load inspection')
        }
        const { _id, __v, createdAt, updatedAt, ...inspectionData } = result.data || {}
        setFormData({
          ...initialForm,
          ...inspectionData,
          date: normalizeDate(inspectionData.date),
        })
        setVersionHistory(result.versions || (result.data ? [result.data] : []))
        setManufacturerDetails(result.data.manufacturerDetails || {})
        setSuccessMessage(null)
        setSubmitted(false)
      } catch (err) {
        setError(err.message || 'Failed to load inspection')
      } finally {
        setLoading(false)
      }
    }

    if ((isEditMode || isViewMode) && editInspectionId) {
      loadInspection(editInspectionId)
    }
  }, [editInspectionId, isEditMode, isViewMode])

  const handleChange = (event) => {
    if (isViewMode) return
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'manufacturer' ? { manufacturer: value } : {}),
    }))

    if (name === 'manufacturer') {
      setManufacturerDetails({})
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

  const handleDeleteInspection = async () => {
    if (!editInspectionId) return
    const confirmed = window.confirm('Delete this inspection? This action cannot be undone.')
    if (!confirmed) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/inspections/${editInspectionId}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to delete inspection')
      }
      navigateToHash('#/')
    } catch (err) {
      setError(err.message || 'Failed to delete inspection')
    } finally {
      setLoading(false)
    }
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

      const url = isEditMode && editInspectionId
        ? `${API_BASE_URL}/inspections/${editInspectionId}`
        : `${API_BASE_URL}/inspections`
      const method = isEditMode && editInspectionId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || result?.message || `Error: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Form submitted successfully:', result)
      setSubmitted(true)
      setSuccessMessage(isEditMode ? 'Inspection record updated successfully!' : 'Inspection record saved successfully!')
      navigateToHash('#/')
    } catch (err) {
      console.error('❌ Error submitting form:', err)
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
  const activeVersion = versionHistory.find((version) => version._id === editInspectionId) || null

  const openVersion = (versionId, mode = 'view') => {
    if (!versionId) return
    navigateToHash(`#/${mode}/${versionId}`)
  }

  const formatVersionStamp = (value) => {
    if (!value) return 'Unknown update'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Unknown update'
    return date.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const mapServiceM8ToForm = (job) => {
    const mapped = {}
    console.log('Mapping ServiceM8 job data to form:', job)
    if (job.client_name) mapped.customerName = job.client_name
    if (job.client_first_name || job.client_last_name) {
      mapped.customerName = [job.client_first_name, job.client_last_name].filter(Boolean).join(' ').trim() || mapped.customerName
    }

    const contact = job.contact || (Array.isArray(job.jobContacts) ? job.jobContacts[0] : null)
    if (contact) {
      if (contact.name) mapped.customerName = mapped.customerName || contact.name
      const contactName = [contact.first, contact.last].filter(Boolean).join('')
      if (contactName) mapped.customerName = mapped.customerName || contactName
      if (contact.mobile) mapped.customerMobile = mapped.customerMobile || contact.mobile
      if (contact.phone) mapped.customerMobile = mapped.customerMobile || contact.phone
      if (contact.email) mapped.email = mapped.email || contact.email
    }

    if (job.client_mobile) mapped.customerMobile = mapped.customerMobile || job.client_mobile
    if (job.client_phone) mapped.customerMobile = mapped.customerMobile || job.client_phone
    if (job.client_email) mapped.email = mapped.email || job.client_email
    if (job.client_address) mapped.address = job.client_address
    if (job.job_address) mapped.address = mapped.address || job.job_address
    if (job.billing_address) mapped.address = mapped.address || job.billing_address

    if (job.generated_job_id) mapped.jobNumber = String(job.generated_job_id)
    if (job.job_number) mapped.jobNumber = mapped.jobNumber || String(job.job_number)
    if (job.uuid) mapped.job_uuid = job.uuid
    if (job.job_uuid) mapped.job_uuid = mapped.job_uuid || job.job_uuid

    const dateValue = job.job_date || job.date || job.work_order_date || job.quote_date
    if (dateValue) {
      const date = new Date(dateValue)
      if (!Number.isNaN(date.getTime())) {
        mapped.date = date.toISOString().slice(0, 10)
      }
    }

    if (job.status) mapped.jobStatus = job.status
    if (job.staff_name) mapped.staffName = job.staff_name
    if (job.assignee_name) mapped.staffName = mapped.staffName || job.assignee_name
    return mapped
  }

  const fetchServiceM8Details = async () => {
    if (!formData.jobNumber?.trim()) {
      setServiceM8Error('Please enter a job number first.')
      return
    }

    setServiceM8Loading(true)
    setServiceM8Error(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/inspections/servicem8/job/${encodeURIComponent(formData.jobNumber)}`,
      )

      if (!response.ok) {
        if (response.status === 404) {
          setServiceM8Error('No ServiceM8 job found for this job number.')
          return
        }
        const result = await response.json()
        throw new Error(result.error || result.message || 'ServiceM8 lookup failed')
      }

      const result = await response.json()
      const mapped = mapServiceM8ToForm(result.data)
      setFormData((prev) => ({
        ...prev,
        ...mapped
      }))
    } catch (err) {
      setServiceM8Error(err.message || 'ServiceM8 lookup failed')
    } finally {
      setServiceM8Loading(false)
    }
  }

  const customerFields = [
    { name: 'customerName', label: 'Customer Name' },
    { name: 'tenantName', label: 'Tenant Name' },
    { name: 'customerMobile', label: 'Customer Mobile', type: 'number', placeholder: 'e.g. 0412 345 678' },
    { name: 'tenantMobile', label: 'Tenant Mobile', type: 'number', placeholder: 'e.g. 0412 345 678' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'contact@company.com' },
    { name: 'address', label: 'Address', type: 'input', rows: 3 },
  ]

  const jobFields = [
    { name: 'jobNumber', label: 'Job Number' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'staffName', label: 'Staff Name' },
    { name: 'jobStatus', label: 'Job Status', type: 'select', options: jobStatusOptions },
  ]

  const damageFields = [
    { name: 'doorType', label: 'Door Type' },
    { name: 'doorBrand', label: 'Door Brand' },
    { name: 'doorStyle', label: 'Door Style' },
    { name: 'doorColour', label: 'Door Colour' },
    { name: 'panelSize', label: 'Panel Size' },
    { name: 'radSizeTotal', label: 'Radius Size Total' },
  ]

  const tapperFields = [
    { name: 'bottom', label: 'Bottom (mm)', type: 'number' },
    { name: 'firstUp', label: '1st Up (mm)', type: 'number' },
    { name: 'second', label: '2nd (mm)', type: 'number' },
    { name: 'third', label: '3rd (mm)', type: 'number' },
    { name: 'topPanel', label: 'Top Panel' },
  ]

  const damageNotesFields = [
    { name: 'windowStyle', label: 'Window Style' },
    { name: 'centreLock', label: 'Centre Lock' },
    { name: 'motorBrand', label: 'Motor Brand' },
    { name: 'motorCondition', label: 'Motor Condition' },
    { name: 'pelmet', label: 'Pelmet' },
    { name: 'jambs', label: 'Jambs' },
    { name: 'covers', label: 'Covers' },
    { name: 'powerPointGarage', label: 'P/Point in Garage' },
    { name: 'backClear', label: '3/2 Back Clear' },
    { name: 'recess', label: 'Recess' },
    { name: 'accessProperty', label: 'Access Property' },
    {
      name: 'taper',
      label: 'Taper (mm)',
      type: 'select',
      options: ["Left", "Right"],
    },
    { name: 'vilo', label: 'Vilo (mm)', type: 'number' },
  ]

  const openingFields = [
    { name: 'openingWidth', label: 'Opening Width', type: 'number', hint: 'wall to wall' },
    { name: 'openingHeight', label: 'Opening Height', type: 'number', hint: 'floor to top of opening' },
  ]

  const clearanceFields = [
    { name: 'leftSideroom', label: 'Left Sideroom', type: 'number', hint: 'wall to track edge' },
    { name: 'rightSideroom', label: 'Right Sideroom', type: 'number', hint: 'track edge to wall' },
    { name: 'headroom', label: 'Headroom', type: 'number', hint: 'top of opening to ceiling' },
  ]

  const heightSurveyFields = [
    { name: 'heightLHS', label: 'Height LHS', type: 'number', hint: 'measured left-side height' },
    { name: 'heightRHS', label: 'Height RHS', type: 'number', hint: 'measured right-side height' },
  ]

  const tableFields = [
    { name: 'lhsFtd', label: 'LHS FTD', type: 'number' },
    { name: 'centreFtd', label: 'Centre FTD', type: 'number' },
    { name: 'rhsFtd', label: 'RHS FTD', type: 'number' },
    { name: 'lhsDth', label: 'LHS DTH', type: 'number' },
    { name: 'centreDth', label: 'Centre DTH', type: 'number' },
    { name: 'rhsDth', label: 'RHS DTH', type: 'number' },
  ]

  const materialFields = [
    { name: 'depositPaid', label: 'Deposit Paid', type: 'select', options: yesNoOptions },
    { name: 'customerConfirmed', label: 'Customer Confirmed', type: 'select', options: yesNoOptions },
    { name: 'manufacturer', label: 'Door Type / Manufacturer', type: 'select', options: materialManufacturers },
  ]

  const g4Fields = [
    { name: 'lightsMoved', label: 'Lights moved', type: 'select', options: yesNoOptions },
    { name: 'chainDrive', label: 'Chain drive', type: 'select', options: yesNoOptions },
  ]
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
                {activeVersion.isCurrent ? 'Current version' : 'Historic version'} • Created {formatVersionStamp(activeVersion.createdAt)}
              </span>
            </div>
          ) : null}
        </div>
        <div className="header-action-group">
          <button type="button" className="modal-secondary" onClick={goBackToDashboard}>
            Back to dashboard
          </button>
          {isViewMode ? (
            <>
              <button
                type="button"
                className="form-submit"
                onClick={() => navigateToHash(`#/edit/${editInspectionId}`)}
                disabled={loading}
              >
                Edit inspection
              </button>
              <button
                type="button"
                className="modal-delete"
                onClick={handleDeleteInspection}
                disabled={loading}
              >
                Delete inspection
              </button>
            </>
          ) : null}
        </div>
      </header>

      <form className="form-layout" onSubmit={handleSubmit}>
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
                        {serviceM8Loading ? 'Fetching…' : 'Fetch details'}
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

        {versionHistory.length > 0 ? (
          <FormCard
            title="Version History"
            subtitle="Every job update is stored as a separate revision so you can track the full decision trail."
          >
            <div className="version-history-grid">
              {versionHistory.map((version) => (
                <article
                  key={version._id}
                  className={`version-item ${version._id === editInspectionId ? 'is-active' : ''}`}
                >
                  <div className="version-item-top">
                    <div>
                      <strong>Version {version.versionNumber || 1}</strong>
                      <div className="field-note">Created {formatVersionStamp(version.createdAt)}</div>
                    </div>
                    <span className={`job-card-status ${version.isCurrent ? 'is-completed' : 'is-default'}`}>
                      {version.isCurrent ? 'Current' : 'Archived'}
                    </span>
                  </div>
                  <div className="version-item-meta">
                    <span>{version.jobStatus || 'Quote'}</span>
                    <span>{version.staffName || 'No staff assigned'}</span>
                    <span>{version.customerName || 'No customer name'}</span>
                  </div>
                  <div className="job-card-actions">
                    <button type="button" className="modal-secondary" onClick={() => openVersion(version._id, 'view')}>
                      View version
                    </button>
                    {version._id === editInspectionId ? null : (
                      <button type="button" className="form-submit" onClick={() => openVersion(version._id, 'edit')}>
                        Use as base
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </FormCard>
        ) : null}

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
        </FormCard>

        <FormCard title="Materials Required for the Job" subtitle="New door — select manufacturer first to load options">
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

        {!isViewMode ? (
          <div className="form-actions">
            <button type="submit" className="form-submit" disabled={loading || !formData.jobNumber?.trim()}>
              {loading ? 'Saving...' : 'Save inspection data'}
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

export default App