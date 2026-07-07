export const getInspectionIdentifier = (inspection) => inspection?.job_uuid || inspection?._id

export const normalizeDateInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

export const formatVersionStamp = (value) => {
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
