import { useState } from 'react'

function FormCard({ title, subtitle, children, footer }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="form-card">
      <div className="card-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="card-actions">
          <button
            type="button"
            className="section-toggle"
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Hide ${title}` : `Show ${title}`}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
          {footer ? <div className="card-footer-actions">{footer}</div> : null}
        </div>
      </div>
      {isExpanded ? <div className="card-body">{children}</div> : null}
    </section>
  )
}

export default FormCard
