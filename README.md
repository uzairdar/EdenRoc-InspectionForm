# EdenRoc Measurement App

Garage door inspection workflow application with:
- React + Vite frontend
- Express + MongoDB backend
- ServiceM8 integration for job lookup

## Project Structure

```
edenroc-measurement-app/
	src/                  # Frontend app
	api/                  # Backend API
	docs/                 # Architecture and development documentation
```

## Quick Start

### 1) Frontend

```bash
npm install
npm run dev
```

### 2) Backend

```bash
cd api
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Backend API: `http://localhost:5000/api`

## Environment Variables

### Frontend (`.env.local`)
- `VITE_API_URL` (optional)
- `VITE_GOOGLE_MAPS_API_KEY` (required for address autocomplete)

### Backend (`api/.env`)
- `MONGODB_URI`
- `PORT`
- `NODE_ENV`
- `SERVICEM8_API_KEY`

## Scripts

Frontend:
- `npm run dev`
- `npm run build`
- `npm run lint`

Backend:
- `cd api && npm run dev`
- `cd api && npm start`

## Documentation

- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Development workflow: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- Backend details: [api/README.md](api/README.md)

## Build Verification

```bash
npm run build
```
