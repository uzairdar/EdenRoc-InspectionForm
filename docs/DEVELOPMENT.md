# Development Guide

## Run Locally

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd api
npm install
npm run dev
```

## Environment Variables

### Frontend (`.env.local`)
- `VITE_API_URL` (optional): Defaults to `http://localhost:5000/api`
- `VITE_GOOGLE_MAPS_API_KEY` (required for address search)

### Backend (`api/.env`)
- `MONGODB_URI`
- `PORT` (default `5000`)
- `NODE_ENV`
- `SERVICEM8_API_KEY`

## Project Standards
- Keep API calls in `src/services`.
- Reuse constants from `src/constants`.
- Prefer pure mapping/format functions in `src/utils`.
- Keep component logic focused on rendering and state orchestration.

## Adding New Features

1. Define static values in `src/constants`.
2. Add or extend API functions in `src/services`.
3. Add pure transformers in `src/utils` if needed.
4. Keep pages/components thin and reuse existing UI components.
5. Update docs in `docs/ARCHITECTURE.md` when structure changes.

## Build and Verification
```bash
npm run build
```

Optional checks:
```bash
npm run lint
```

## Deployment Notes
- Frontend and backend can be deployed separately.
- Ensure production frontend `VITE_API_URL` points to the deployed backend API.
- Ensure backend has valid MongoDB and ServiceM8 credentials.
