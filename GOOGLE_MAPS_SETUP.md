# Google Maps API Setup Guide

Google Maps address autocomplete has been integrated into the Customer Details section.

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing):
   - Click the project dropdown at the top
   - Click **NEW PROJECT**
   - Enter project name: `EdenRoc Measurement App`
   - Click **CREATE**

3. Enable required APIs:
   - Go to **APIs & Services** → **Library**
   - Search for and enable:
     - ✅ **Places API**
     - ✅ **Maps JavaScript API**

4. Create API Key:
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **API Key**
   - Copy your API key

5. **(Optional but Recommended)** Restrict your key:
   - Click on your newly created API key
   - Under **Application restrictions**, select **HTTP referrers**
   - Add your domain (e.g., `localhost:5173` for development, your production domain later)
   - Under **API restrictions**, select **Restrict key** and check:
     - ✅ Places API
     - ✅ Maps JavaScript API

## Step 2: Add API Key to Your Project

### Option A: Create `.env` file (Recommended)

Create a file at the project root: `.env.local`

```bash
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your actual API key.

### Option B: Use `.env.example`

We've provided a template. Copy it:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your API key.

## Step 3: Restart Development Server

After adding the API key, restart your dev server:

```bash
npm run dev
```

## How It Works

The address field in **Customer Details** now includes:
- ✅ Real-time address autocomplete suggestions
- ✅ Full formatted address selection from Google Places
- ✅ Fallback text input if API key is missing
- ✅ Responsive design for mobile/tablet/desktop

## Testing

1. Navigate to the form
2. Go to **Customer Details** section
3. Start typing in the **Address** field
4. You should see autocomplete suggestions dropdown
5. Select an address to auto-fill the full formatted address

## Common Issues

### ❌ "API key not configured" message appears

- Check `.env.local` file exists in root folder
- Verify `VITE_GOOGLE_MAPS_API_KEY=` has your actual key (not the word "your_actual_api_key_here")
- Restart dev server: `npm run dev`

### ❌ Autocomplete not working but no error

- Ensure **Places API** is enabled in Google Cloud Console
- Check API key restrictions in Google Cloud Console
- Make sure key is valid and not expired

### ❌ "Invalid API key" error

- Double-check you copied the entire API key correctly
- No spaces before/after the key in `.env.local`

## Production Deployment

When deploying to production:

1. Add new domain to API key restrictions in Google Cloud Console
2. Set environment variable on your hosting platform:
   - **Vercel**: Settings → Environment Variables
   - **Netlify**: Site settings → Build & Deploy → Environment
   - **Heroku**: Config Vars

Set variable name: `VITE_GOOGLE_MAPS_API_KEY`
Set variable value: Your actual API key

## Security Notes

⚠️ **Important**: 
- Never commit `.env.local` to git (it's in `.gitignore`)
- Always use API key restrictions in production
- Consider using separate keys for development/production
- Monitor API usage in Google Cloud Console to avoid unexpected charges

## File Changes Made

- ✅ Created: `src/components/AddressSearch.jsx` - Address autocomplete component
- ✅ Updated: `src/App.jsx` - Integrated AddressSearch in customer details
- ✅ Updated: `package.json` - Added `react-google-autocomplete` dependency
- ✅ Created: `.env.example` - Template for environment variables

Enjoy your address autocomplete! 🗺️
