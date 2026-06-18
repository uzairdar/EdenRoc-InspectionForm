# EdenRoc Measurement App - Backend API

MERN stack backend for the garage door inspection form application.

## Setup Instructions

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Environment Variables

The `.env` file is already configured with the MongoDB connection string. No additional setup required.

```
MONGODB_URI=mongodb+srv://uzairdar01_db_user:Iy4f7YBAqVNdGR5A@edenrocform.hl7yjac.mongodb.net/?appName=EdenRocForm
PORT=5000
NODE_ENV=development
```

### 3. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Create Inspection Record
- **POST** `/api/inspections`
- Body: Form data object
- Response: Saved inspection document

### Get All Inspections
- **GET** `/api/inspections`
- Response: Array of all inspection records

### Get Single Inspection
- **GET** `/api/inspections/:id`
- Response: Single inspection document

### Update Inspection
- **PUT** `/api/inspections/:id`
- Body: Updated fields
- Response: Updated inspection document

### Delete Inspection
- **DELETE** `/api/inspections/:id`
- Response: Deleted inspection document

## Database Schema

The Inspection schema includes all form fields:
- Customer details (name, contact, address)
- Job details (number, date, staff, status)
- Damage details (door type, brand, style, measurements)
- Additional damage notes (motor, pelmet, jambs, etc.)
- Measurements (opening, clearance, height survey)
- Table measurements (FTD/DTC values)
- Material details (manufacturer, deposit, confirmation)
- Special checks (G4 doors, lights, chain drive)

All fields are optional and stored as mixed types for flexibility.

## Frontend Configuration

Update `src/App.jsx` or set the `VITE_API_URL` environment variable:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
```

For production, set:
```bash
VITE_API_URL=https://your-api-domain.com/api
```

## Testing

You can test the API using:
- **Postman** or **Insomnia**
- **cURL** command line
- **Frontend form submission**

Example cURL:
```bash
curl -X POST http://localhost:5000/api/inspections \
  -H "Content-Type: application/json" \
  -d '{"customerName":"John Doe","email":"john@example.com"}'
```

## Troubleshooting

### MongoDB Connection Error
- Check internet connection
- Verify credentials in `.env`
- Ensure IP is whitelisted in MongoDB Atlas

### CORS Error
- The backend has CORS enabled for all origins in development
- For production, configure specific allowed origins

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill process using port 5000: `lsof -ti:5000 | xargs kill -9`
