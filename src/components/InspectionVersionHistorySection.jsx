import FormCard from './FormCard'

export default function InspectionVersionHistorySection({
  versionHistory,
  activeVersionId,
  formatVersionStamp,
  openVersion,
}) {
  if (!versionHistory.length) {
    return null
  }
  return (
    <FormCard
      title="Version History"
      subtitle="Every job update is stored as a separate revision so you can track the full decision trail."
    >
      <div className="version-history-grid">
        {versionHistory.map((version) => (
          <article
            key={version._id}
            className={`version-item ${version._id === activeVersionId ? 'is-active' : ''}`}
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
              {version._id === activeVersionId ? null : (
                <button type="button" className="form-submit" onClick={() => openVersion(version._id, 'edit')}>
                  Use as base
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </FormCard>
  )
}
