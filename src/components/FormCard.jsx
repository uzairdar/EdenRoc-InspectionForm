function FormCard({ title, subtitle, children, footer }) {
  return (
    <section className="form-card">
      <div className="card-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {footer ? <div className="card-actions">{footer}</div> : null}
      </div>
      <div className="card-body">{children}</div>
    </section>
  )
}

export default FormCard
