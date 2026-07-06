import React from 'react'

export default function Loader({
  variant = 'panel',
  title = 'Loading',
  description = 'Please wait while the request completes.',
  className = '',
}) {
  const rootClassName = ['loader', `loader--${variant}`, className].filter(Boolean).join(' ')

  return (
    <div className={rootClassName} role="status" aria-live="polite" aria-busy="true">
      <div className="loader-visual" aria-hidden="true">
        <span className="loader-ring loader-ring--outer" />
        <span className="loader-ring loader-ring--inner" />
        <span className="loader-core" />
      </div>
      <div className="loader-copy">
        <strong>{title}</strong>
        {description ? <span>{description}</span> : null}
      </div>
    </div>
  )
}
