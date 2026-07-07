# EdenRoc Measurement App - Backend API

Express + MongoDB backend for inspection record storage, versioning, and ServiceM8 lookup integration.

## Setup

```bash
cd api
npm install
```

Create `api/.env` with:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
SERVICEM8_API_KEY=your_servicem8_api_key
```

Start server:

```bash
npm run dev
```

API root: `http://localhost:5000/api`

## API Endpoints

### Inspection Records
- `POST /api/inspections`: Create a new inspection or next version
- `GET /api/inspections`: Get latest inspection per job group
- `GET /api/inspections/:id`: Fetch by `job_uuid` or Mongo `_id`
- `PUT /api/inspections/:id`: Create a new version from existing record
- `DELETE /api/inspections/:id`: Delete all versions in the group

### ServiceM8
- `GET /api/inspections/servicem8/test`: Validate API key
- `GET /api/inspections/servicem8/job/:jobNumber`: Lookup by generated job number
- `GET /api/inspections/servicem8/job-uuid/:jobUuid`: Lookup by ServiceM8 UUID

## Notes
- Versioning is append-only. Updates generate new records.
- Identifier routes support `job_uuid` first, then Mongo `_id` fallback.
- Save operations no longer post links back to ServiceM8 notes.

## Security
- Never commit `.env` files.
- Rotate any credentials that were previously exposed.
