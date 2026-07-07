export const mapServiceM8ToForm = (job) => {
  const mapped = {}

  if (job.client_name) mapped.customerName = job.client_name
  if (job.client_first_name || job.client_last_name) {
    mapped.customerName = [job.client_first_name, job.client_last_name].filter(Boolean).join(' ').trim() || mapped.customerName
  }

  const contact = job.contact || (Array.isArray(job.jobContacts) ? job.jobContacts[0] : null)
  if (contact) {
    if (contact.name) mapped.customerName = mapped.customerName || contact.name
    const contactName = [contact.first, contact.last].filter(Boolean).join(' ').trim()
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
