import React, { useEffect, useMemo, useState } from 'react'
import '../App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const importantFields = ['jobNumber', 'customerName', 'email', 'staffName', 'jobStatus']
const searchableKeys = ['jobNumber', 'customerName', 'staffName', 'email']

export default function Dashboard() {
  const [inspections, setInspections] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/inspections`)
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to load inspections')
      }
      setInspections(result.data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch inspections')
    } finally {
      setLoading(false)
    }
  }

  const filteredInspections = useMemo(() => {
    if (!searchTerm.trim()) return inspections
    const term = searchTerm.toLowerCase()
    return inspections.filter((inspection) =>
      searchableKeys.some((key) => String(inspection[key] || '').toLowerCase().includes(term))
    )
  }, [inspections, searchTerm])

  const navigateToHash = (hash) => {
    window.history.pushState(null, '', hash)
    window.dispatchEvent(new Event('hashchange'))
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const viewInspection = (inspection) => {
    if (!inspection) return
    navigateToHash(`#/view/${inspection._id}`)
  }

  const editInspection = (inspection) => {
    if (!inspection) return
    navigateToHash(`#/edit/${inspection._id}`)
  }

  const removeInspection = async (inspection) => {
    if (!inspection) return
    const confirmed = window.confirm(`Delete job ${inspection.jobNumber || inspection.customerName}? This cannot be undone.`)
    if (!confirmed) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/inspections/${inspection._id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to delete inspection')
      }
      setInspections((prev) => prev.filter((item) => item._id !== inspection._id))
    } catch (err) {
      setError(err.message || 'Failed to delete inspection')
    } finally {
      setLoading(false)
    }
  }

  const displayValue = (value) => {
    if (value === undefined || value === null || value === '') return '—'
    return String(value)
  }

  const getStatusClass = (status) => {
    const value = String(status || '').toLowerCase()
    if (value.includes('quote')) return 'is-quote'
    if (value.includes('work')) return 'is-work-order'
    if (value.includes('completed')) return 'is-completed'
    if (value.includes('unsuccussfull') || value.includes('unsuccessful')) return 'is-unsuccessful'
    return 'is-default'
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Inspection dashboard</h1>
          <p className="hero-copy">Search, review, update, and remove inspection jobs from a single place.</p>
        </div>
      </header>

      <section className="form-layout">
        <div className="form-card">
          <div className="card-header">
            <div>
              <h2>New measurement</h2>
              <p>Create a new inspection record from the form.</p>
            </div>
          </div>
          <div className="card-body">
            <p className="field-note">Tap the button below to open the measurement form.</p>
            <div className="form-actions">
              <button className="form-submit" onClick={() => navigateToHash('#/new')}>
                New Measurement
              </button>
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="card-header">
            <div>
              <h2>Recent inspections</h2>
              <p>Search by job number, customer name, staff name, or email.</p>
            </div>
          </div>

          <div className="card-body">
            <div className="dashboard-search-row">
              <input
                type="search"
                className="search-input"
                value={searchTerm}
                placeholder="Search jobs, customer, staff, or email..."
                onChange={handleSearchChange}
              />
            </div>

            {loading && <p className="field-note">Loading inspections…</p>}
            {error && <p className="field-note" style={{ color: '#b91c1c' }}>{error}</p>}
            {!loading && filteredInspections.length === 0 && (
              <p className="field-note">No inspections match your search.</p>
            )}

            <div className="jobs-grid">
              {filteredInspections.map((inspection) => (
                <article
                  key={inspection._id}
                  className="job-card"
                >
                  <div className="job-card-main">
                    <span className="job-card-title">{inspection.jobNumber || 'No job number'}</span>
                    <span className={`job-card-status ${getStatusClass(inspection.jobStatus)}`}>
                      {inspection.jobStatus || 'Quote'}
                    </span>
                  </div>
                  <div className="job-card-details">
                    <span>{inspection.customerName || 'No customer name'}</span>
                    <span>{inspection.email || 'No email'}</span>
                    <span>{inspection.staffName || 'No staff name'}</span>
                    <span>Version {inspection.versionNumber || 1}</span>
                  </div>

                  <div className="job-card-actions">
                    <button type="button" className="modal-secondary" onClick={() => viewInspection(inspection)}>
                      View
                    </button>
                    <button type="button" className="form-submit" onClick={() => editInspection(inspection)}>
                      Edit
                    </button>
                    <button type="button" className="modal-delete" onClick={() => removeInspection(inspection)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
