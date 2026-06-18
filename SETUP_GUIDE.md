# MERN Stack Application - Complete Setup & Running Guide

This is a full-stack MERN (MongoDB, Express, React, Node.js) application for garage door inspection forms.

## 📁 Project Structure

```
edenroc-measurement-app/
├── api/                          # Backend (Node.js + Express)
│   ├── models/
│   │   └── Inspection.js         # MongoDB schema
│   ├── routes/
│   │   └── inspections.js        # API endpoints
│   ├── server.js                 # Express server setup
│   ├── .env                      # MongoDB credentials (configured)
│   ├── package.json              # Backend dependencies
│   └── README.md                 # Backend setup guide
│
├── src/                          # Frontend (React + Vite)
│   ├── App.jsx                   # Main form component
│   ├── App.css                   # Form styling
│   ├── main.jsx                  # Router setup
│   ├── pages/Dashboard.jsx       # Dashboard landing page
│   ├── components/
│   │   ├── FormCard.jsx
│   │   └── FormField.jsx
│   ├── formConfig.js             # Dropdown options & configs
│   └── ...
│
├── package.json                  # Frontend dependencies
├── vite.config.js                # Vite configuration
└── index.html                    # Entry point
```

## 🚀 Quick Start (Local Development)

### Step 1: Install Frontend Dependencies
```bash
cd edenroc-measurement-app
npm install
```

### Step 2: Install Backend Dependencies
```bash
cd api
npm install
cd ..
```

### Step 3: Start Backend Server (in one terminal)
```bash
cd api
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server is running on port 5000
📡 API base URL: http://localhost:5000/api
```

### Step 4: Start Frontend Dev Server (in another terminal)
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 🎯 How to Use

1. **Dashboard**: Navigate to the dashboard at `/` (default)
2. **New Measurement**: Click "New Measurement" button
3. **Fill Form**: Complete all form fields
4. **Save**: Click "Save inspection data" to submit to database
5. **Success**: See confirmation and data gets saved to MongoDB

## 🗄️ Database

- **MongoDB Atlas** (Cloud)
- **Connection**: Already configured in `api/.env`
- **Database**: edenrocform
- **Collection**: inspections (auto-created on first save)

## 📚 API Endpoints

All endpoints available at `http://localhost:5000/api`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/inspections` | Create new inspection |
| GET | `/inspections` | Get all inspections |
| GET | `/inspections/:id` | Get single inspection |
| PUT | `/inspections/:id` | Update inspection |
| DELETE | `/inspections/:id` | Delete inspection |
| GET | `/health` | Health check |

## 🔧 Frontend Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔧 Backend Commands

```bash
cd api
npm run dev      # Start with auto-reload
npm start        # Start production server
```

## 🌐 Environment Configuration

### Frontend (.env.local)
```bash
VITE_API_URL=http://localhost:5000/api
```

### Backend (api/.env)
```bash
MONGODB_URI=mongodb+srv://uzairdar01_db_user:Iy4f7YBAqVNdGR5A@edenrocform.hl7yjac.mongodb.net/?appName=EdenRocForm
PORT=5000
NODE_ENV=development
```

## 📱 Responsive Design

✅ **Laptop** (1024px+): Full layout with 2-3 columns
✅ **Tablet** (640px-1024px): Optimized 2-column layout
✅ **Mobile** (< 640px): Single column, full-width inputs

## 🧪 Testing the Form

### Option 1: Using the UI
1. Start both servers
2. Navigate to `http://localhost:5173`
3. Click "New Measurement"
4. Fill in some test data
5. Click "Save inspection data"

### Option 2: Using cURL
```bash
curl -X POST http://localhost:5000/api/inspections \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "email": "test@example.com",
    "jobNumber": "JOB-001",
    "doorBrand": "Test Brand"
  }'
```

### Option 3: Using Postman
1. Import the endpoints to Postman
2. POST to `http://localhost:5000/api/inspections`
3. Add form data in JSON body
4. Click Send

## 🐛 Troubleshooting

### Frontend Won't Start
```bash
npm install
npm run dev
```

### Backend Won't Connect to Database
- Check internet connection
- Verify MongoDB credentials in `api/.env`
- Ensure your IP is whitelisted in MongoDB Atlas

### CORS Error
- Backend has CORS enabled by default
- If issues persist, update `api/server.js` with specific origins

### Port 5000 Already in Use (Windows)
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Port 5000 Already in Use (Mac/Linux)
```bash
lsof -ti:5000 | xargs kill -9
```

## 📦 Production Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku/Railway/Render)
```bash
# Set environment variables on platform
git push heroku main
```

## 📞 Support

For issues with:
- **Frontend**: Check console errors (F12)
- **Backend**: Check terminal output
- **Database**: Check MongoDB Atlas dashboard

## ✅ Checklist

- [ ] Both `npm install` commands completed
- [ ] `.env` files configured (already done)
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can navigate to form
- [ ] Can submit form data
- [ ] Data appears in MongoDB Atlas

Happy inspecting! 🚀
