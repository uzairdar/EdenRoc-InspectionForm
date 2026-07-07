# EdenRoc Measurement App Architecture

## Overview
This project is a full-stack inspection workflow application:
- Frontend: React + Vite
- Backend: Express + MongoDB (Mongoose)
- External integration: ServiceM8

The app supports:
- Creating and versioning inspection records
- Loading jobs from ServiceM8
- Deep-link entry by `job_uuid`
- Viewing and editing version history

## Frontend Structure

```
src/
  components/        # Reusable UI components
  constants/         # App constants and field schemas
  pages/             # Route-level pages
    InspectionPage.jsx
    Dashboard.jsx
  services/          # API clients and request wrappers
  utils/             # Pure utility helpers and mappers
  App.jsx            # Thin app shell
  main.jsx           # Hash-based root router
```

### Key Design Rules
- Keep UI components presentational when possible.
- Keep network logic in `src/services`.
- Keep fixed values and form schemas in `src/constants`.
- Keep pure helpers in `src/utils`.
- Avoid direct `fetch` calls in page/components when an API service exists.

### Current Shared Modules
- `src/constants/api.js`: API base URL
- `src/constants/dashboard.js`: Dashboard constants
- `src/constants/formSchema.js`: Initial form model and form field definitions
- `src/services/inspectionsApi.js`: Inspection and ServiceM8 request layer
- `src/utils/navigation.js`: Hash navigation helper
- `src/utils/inspection.js`: Shared inspection utility functions
- `src/utils/servicem8Mapper.js`: ServiceM8 job to form mapping
- `src/pages/InspectionPage.jsx`: Inspection form page

## Backend Structure

```
api/
  models/
    Inspection.js
  routes/
    inspections.js
  server.js
```

### Backend Responsibilities
- Persist inspection records in MongoDB
- Maintain version chains for each inspection group
- Serve dashboard and record-detail APIs
- Resolve identifiers by `job_uuid` or Mongo `_id`
- Proxy ServiceM8 job lookups (by number and UUID)

## Request Flow

1. Dashboard fetches latest grouped inspection records.
2. View/Edit route resolves inspection by identifier.
3. If a UUID route has no local record, frontend can load ServiceM8 job data.
4. Save submits:
- `PUT` when editing a local database record
- `POST` when creating from ServiceM8-only context

## Versioning Model
- `versionGroupId` identifies a version chain
- `versionNumber` increments on each edit
- `isCurrent` marks active version
- Edits create a new document; they do not mutate previous versions

## Suggested Next Refactors
- Split `InspectionPage.jsx` into domain sections (customer/job/damage/material/sign-off)
- Move hash route parsing into a dedicated hook (`useHashRoute`)
- Add unit tests for:
  - `servicem8Mapper`
  - identifier resolution utilities
  - API client error normalization
- Add backend route tests for versioning and UUID fallbacks
