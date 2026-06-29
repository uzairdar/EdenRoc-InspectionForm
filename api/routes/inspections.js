import express from 'express'
import Inspection from '../models/Inspection.js'
import https from 'node:https'

const router = express.Router()
const SERVICE_M8_BASE_URL = 'https://api.servicem8.com/api_1.0'
const SERVICE_M8_API_KEY = process.env.SERVICEM8_API_KEY
console.log('ServiceM8 API key present:', !!SERVICE_M8_API_KEY)

const createServiceM8AuthHeader = () => {
  if (!SERVICE_M8_API_KEY) return {}
  return { 'X-API-Key': SERVICE_M8_API_KEY }
}

const nodeHttpsRequest = (urlString, options = {}) =>
  new Promise((resolve, reject) => {
    const url = new URL(urlString)
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      hostname: url.hostname,
      path: url.pathname + (url.search || ''),
      port: url.port || 443,
    }

    const req = https.request(reqOptions, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: async () => {
            try {
              return data ? JSON.parse(data) : {}
            } catch (e) {
              return { raw: data }
            }
          },
          text: async () => data,
        })
      })
    })

    req.on('error', (err) => reject(err))

    if (options.body) {
      if (typeof options.body === 'string' || options.body instanceof String) {
        req.write(options.body)
      } else if (options.body instanceof URLSearchParams) {
        req.write(options.body.toString())
      }
    }
    req.end()
  })

const serviceM8Fetch = async (path, options = {}) => {
  if (!SERVICE_M8_API_KEY) {
    throw new Error('ServiceM8 API key is not configured')
  }
  const url = `${SERVICE_M8_BASE_URL}${path}`
  const headers = {
    Accept: 'application/json',
    ...createServiceM8AuthHeader(),
    ...(options.headers || {}),
  }

  if (typeof fetch === 'function') {
    return fetch(url, { ...options, headers })
  }

  // Fallback to node https request
  return nodeHttpsRequest(url, { ...options, headers })
}

const buildServiceM8FilterUrl = (basePath, filterValue) => {
  const params = new URLSearchParams()
  params.set('$filter', filterValue)
  return `${basePath}?${params.toString()}`
}

const findServiceM8JobContactsByJobUuid = async (jobUuid) => {
  const response = await serviceM8Fetch(buildServiceM8FilterUrl('/jobcontact.json', `job_uuid eq '${jobUuid}'`))
  let data
  try {
    data = await response.json()
  } catch (err) {
    const text = await response.text()
    console.warn('ServiceM8 job contact non-JSON response:', text)
    if (!response.ok) {
      throw new Error(text || 'ServiceM8 job contact lookup failed')
    }
    return []
  }

  if (!response.ok) {
    const serverMessage = data && (data.message || data.error || data.error_description)
    const err = new Error(`ServiceM8 job contact lookup failed${serverMessage ? `: ${serverMessage}` : ''}`)
    err.status = response.status
    throw err
  }

  if (Array.isArray(data)) {
    return data
  }
  return data?.jobContacts || []
}

const findServiceM8JobByNumber = async (jobNumber) => {
  const response = await serviceM8Fetch(buildServiceM8FilterUrl('/job.json', `generated_job_id eq '${jobNumber}'`))
  let data
  try {
    data = await response.json()
  } catch (err) {
    const text = await response.text()
    console.warn('ServiceM8 non-JSON response:', text)
    if (!response.ok) {
      throw new Error(text || 'ServiceM8 job lookup failed')
    }
    return { raw: text }
  }

  if (!response.ok) {
    const serverMessage = data && (data.message || data.error || data.error_description)
    const authMessage = response.status === 401 ? 'ServiceM8 authorization failed' : 'ServiceM8 job lookup failed'
    const err = new Error(`${authMessage}${serverMessage ? `: ${serverMessage}` : ''}`)
    err.status = response.status
    throw err
  }

  const job = Array.isArray(data) ? data[0] || null : data || null
  if (!job) {
    return null
  }

  const hasContactData = Boolean(job.contact || (Array.isArray(job.jobContacts) && job.jobContacts.length > 0))
  if (job.uuid && !hasContactData) {
    try {
      const contacts = await findServiceM8JobContactsByJobUuid(job.uuid)
      if (contacts.length > 0) {
        job.jobContacts = contacts
        job.contact = contacts[0]
      }
    } catch (contactError) {
      console.warn('ServiceM8 job contact fetch failed:', contactError.message)
    }
  }

  return job
}

const createServiceM8JobNote = async (jobId, noteText) => {
  const body = JSON.stringify({
    related_object: 'job',
    related_object_uuid: jobId,
    note: noteText,
  })

  const response = await serviceM8Fetch('/note.json', {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()
  if (!response.ok) {
    const serverMessage = data && (data.message || data.error || data.error_description)
    throw new Error(serverMessage || 'ServiceM8 job note creation failed')
  }
  return data
}

// POST - Create a new inspection record
router.post('/', async (req, res) => {
  console.log('Received new inspection record:', req.body)
  const payload = {
    ...req.body,
    lhsDth: req.body.lhsDth ?? req.body.lhsDtc,
    centreDth: req.body.centreDth ?? req.body.centreDtc,
    rhsDth: req.body.rhsDth ?? req.body.rhsDtc,
  }
  payload.jobNumber = String(payload.jobNumber || '').trim()

  if (!payload.jobNumber) {
    return res.status(400).json({
      success: false,
      message: 'Job Number is required before saving inspection data.',
      error: 'Job Number is required before saving inspection data.',
    })
  }

  try {
    const inspection = new Inspection(payload)
    const saved = await inspection.save()
    if (SERVICE_M8_API_KEY) {
      try {
        const serviceJobUuid = payload.job_uuid || (payload.jobNumber ? await findServiceM8JobByNumber(payload.jobNumber).then((job) => job?.uuid) : null)
        if (serviceJobUuid) {
          const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`
          const inspectionLink = `${origin}/#/view/${saved._id}`
          await createServiceM8JobNote(serviceJobUuid, `Inspection details available at: ${inspectionLink}`)
        }
      } catch (integrationError) {
        console.warn('ServiceM8 integration failed:', integrationError.message)
      }
    }

    res.status(201).json({
      success: true,
      message: 'Inspection record saved successfully',
      data: saved,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error saving inspection record',
      error: error.message,
    })
  }
})

// GET - Fetch all inspection records
router.get('/', async (req, res) => {
  try {
    const inspections = await Inspection.find().sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      data: inspections,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error fetching inspections',
      error: error.message,
    })
  }
})

// GET - Test ServiceM8 API key connectivity
router.get('/servicem8/test', async (req, res) => {
  if (!SERVICE_M8_API_KEY) {
    return res.status(500).json({
      success: false,
      message: 'ServiceM8 API key is not configured',
    })
  }

  try {
    const response = await serviceM8Fetch('/company.json')
    const data = await response.json()
    res.status(200).json({
      success: true,
      message: 'ServiceM8 API key is valid',
      data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ServiceM8 API key test failed',
      error: error.message,
    })
  }
})

// GET - Lookup a ServiceM8 job by job number
router.get('/servicem8/job/:jobNumber', async (req, res) => {
  if (!SERVICE_M8_API_KEY) {
    return res.status(500).json({
      success: false,
      message: 'ServiceM8 API key is not configured',
    })
  }

  try {
    const job = await findServiceM8JobByNumber(req.params.jobNumber)
    console.log('ServiceM8 job lookup xresult:', job)
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'ServiceM8 job not found',
      })
    }
    res.status(200).json({
      success: true,
      data: job,
    })
  } catch (error) {
    const status = error.status || 400
    res.status(status).json({
      success: false,
      message: error.message || 'ServiceM8 lookup failed',
      error: error.message || 'ServiceM8 lookup failed',
    })
  }
})

// GET - Fetch a single inspection by ID
router.get('/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found',
      })
    }
    res.status(200).json({
      success: true,
      data: inspection,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error fetching inspection',
      error: error.message,
    })
  }
})

// PUT - Update an inspection record
router.put('/:id', async (req, res) => {
  const payload = {
    ...req.body,
    lhsDth: req.body.lhsDth ?? req.body.lhsDtc,
    centreDth: req.body.centreDth ?? req.body.centreDtc,
    rhsDth: req.body.rhsDth ?? req.body.rhsDtc,
  }
  delete payload.lhsDtc
  delete payload.centreDtc
  delete payload.rhsDtc
  payload.jobNumber = String(payload.jobNumber || '').trim()

  if (!payload.jobNumber) {
    return res.status(400).json({
      success: false,
      message: 'Job Number is required before updating inspection data.',
      error: 'Job Number is required before updating inspection data.',
    })
  }

  try {
    const inspection = await Inspection.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    })
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found',
      })
    }
    res.status(200).json({
      success: true,
      message: 'Inspection updated successfully',
      data: inspection,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating inspection',
      error: error.message,
    })
  }
})

// DELETE - Delete an inspection record
router.delete('/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findByIdAndDelete(req.params.id)
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found',
      })
    }
    res.status(200).json({
      success: true,
      message: 'Inspection deleted successfully',
      data: inspection,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting inspection',
      error: error.message,
    })
  }
})

export default router
