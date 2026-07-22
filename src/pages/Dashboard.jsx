import React, { useEffect, useMemo, useState } from 'react'
import '../App.css'
import Loader from '../components/Loader'
import { SEARCHABLE_KEYS, PAGE_SIZE } from '../constants/dashboard'
import { navigateToHash } from '../utils/navigation'
import { getInspectionIdentifier } from '../utils/inspection'
import { fetchInspections, deleteInspectionByIdentifier } from '../services/inspectionsApi'

export default function Dashboard() {
  const [inspections, setInspections] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchInspections()
      setInspections(data)
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
      SEARCHABLE_KEYS.some((key) => String(inspection[key] || '').toLowerCase().includes(term))
    )
  }, [inspections, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredInspections.length / PAGE_SIZE))

  const paginatedInspections = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredInspections.slice(startIndex, startIndex + PAGE_SIZE)
  }, [currentPage, filteredInspections])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    setCurrentPage(page)
  }

  const viewInspection = (inspection) => {
    if (!inspection) return
    const identifier = getInspectionIdentifier(inspection)
    if (!identifier) return
    navigateToHash(`#/view/${identifier}`)
  }

  const editInspection = (inspection) => {
    if (!inspection) return
    const identifier = getInspectionIdentifier(inspection)
    if (!identifier) return
    navigateToHash(`#/edit/${identifier}`)
  }

  const removeInspection = async (inspection) => {
    if (!inspection) return
    const confirmed = window.confirm(`Delete job ${inspection.jobNumber || inspection.customerName}? This cannot be undone.`)
    if (!confirmed) return

    const identifier = getInspectionIdentifier(inspection)
    if (!identifier) {
      setError('Unable to delete this inspection because it does not have a job UUID or record id.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await deleteInspectionByIdentifier(identifier)
      setInspections((prev) => prev.filter((item) => getInspectionIdentifier(item) !== identifier))
    } catch (err) {
      setError(err.message || 'Failed to delete inspection')
    } finally {
      setLoading(false)
    }
  }

  const getStatusClass = (status) => {
    const value = String(status || '').toLowerCase().replace('unsuccussfull', 'unsuccessful')
    if (value.includes('quote')) return 'is-quote'
    if (value.includes('work')) return 'is-work-order'
    if (value.includes('completed')) return 'is-completed'
    if (value.includes('unsuccessful')) return 'is-unsuccessful'
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

            {loading ? (
              <Loader
                variant="panel"
                title="Loading inspections"
                description="Fetching the latest records from the database."
              />
            ) : null}
            {error && <p className="field-note" style={{ color: '#b91c1c' }}>{error}</p>}
            {!loading && filteredInspections.length === 0 && (
              <p className="field-note">No inspections match your search.</p>
            )}

            <div className="jobs-grid">
              {paginatedInspections.map((inspection) => (
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
                    {/* <button type="button" className="modal-delete" onClick={() => removeInspection(inspection)}>
                      Delete
                    </button> */}
                  </div>
                </article>
              ))}
            </div>

            {!loading && filteredInspections.length > PAGE_SIZE ? (
              <div className="pagination-bar">
                <p className="field-note pagination-summary">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredInspections.length)} of {filteredInspections.length}
                </p>
                <div className="pagination-controls">
                  <button
                    type="button"
                    className="modal-secondary pagination-button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`pagination-page ${page === currentPage ? 'is-active' : ''}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="modal-secondary pagination-button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

    </main>
  )
}
