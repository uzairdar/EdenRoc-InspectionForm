import { API_BASE_URL } from '../constants/api'

const readJson = async (response) => {
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || payload?.error || 'Request failed')
  }
  return payload
}

export const fetchInspections = async () => {
  const response = await fetch(`${API_BASE_URL}/inspections`)
  const payload = await readJson(response)
  return payload.data || []
}

export const fetchInspectionByIdentifier = async (identifier) => {
  const response = await fetch(`${API_BASE_URL}/inspections/${encodeURIComponent(identifier)}`)
  return readJson(response)
}

export const deleteInspectionByIdentifier = async (identifier) => {
  const response = await fetch(`${API_BASE_URL}/inspections/${encodeURIComponent(identifier)}`, {
    method: 'DELETE',
  })
  return readJson(response)
}

export const submitInspection = async ({ identifier, data, isUpdate }) => {
  const url = isUpdate
    ? `${API_BASE_URL}/inspections/${encodeURIComponent(identifier)}`
    : `${API_BASE_URL}/inspections`

  const response = await fetch(url, {
    method: isUpdate ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return readJson(response)
}

export const fetchServiceM8JobByNumber = async (jobNumber) => {
  const response = await fetch(`${API_BASE_URL}/inspections/servicem8/job/${encodeURIComponent(jobNumber)}`)
  return readJson(response)
}

export const fetchServiceM8JobByUuid = async (jobUuid) => {
  const response = await fetch(`${API_BASE_URL}/inspections/servicem8/job-uuid/${encodeURIComponent(jobUuid)}`)
  return readJson(response)
}
