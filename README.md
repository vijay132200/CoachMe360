# CoachMe360

A comprehensive 360° feedback and leadership development platform powered by AI.

## Features

- **360° Feedback**: Collect and analyze multi-source feedback
- **Self Assessment**: Leadership competency self-evaluation
- **Pulse Checks**: Regular team wellbeing surveys
- **AI-Powered Reports**: Gemini-powered insights and recommendations
- **GROW Goals**: Goal setting and tracking
- **Role-Play Practice**: AI-driven feedback conversation simulations
- **Leadership Simulations**: Scenario-based decision making

## Development

### Prerequisites

- Node.js 20+
- npm

### Running Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`. In development mode, the Express server runs alongside the Vite dev server, providing both the API and client.

### Building for Production

```bash
npm run build
```

This creates:
- `dist/public/` - Static client files (SPA)
- `dist/` - Bundled server files

To run the production build locally:
```bash
npm start
```

## Deployment

### Deploying to Vercel (Static Mode)

The application can be deployed to Vercel as a static site with demo data. This is perfect for previews and demos.

#### Quick Deploy

1. Connect your repository to Vercel
2. Vercel will automatically detect the build settings from `vercel.json`
3. Deploy!

#### Static Mode Features

When deployed without a backend API:
- **Read-only mode**: View demo data for managers, competencies, and dashboard charts
- **Static fallback**: All GET endpoints serve pre-generated JSON files from `/data`
- **UI indicators**: Submit buttons are disabled with helpful messages

#### Connecting to a Backend

To enable full functionality (create, edit, AI features):

1. Deploy your Express backend separately (e.g., Railway, Render, Fly.io)
2. Set the environment variable in Vercel:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```
3. Redeploy

The app will automatically:
- Use the backend API for all requests
- Fall back to static data if the API is unavailable
- Enable all submit/create/edit functionality

### Deploying the Full Stack

For a complete deployment with backend:

#### Backend Options

1. **Replit** (Recommended for development)
   - Deploy directly from Replit
   - Includes built-in database support

2. **Railway / Render / Fly.io**
   - Deploy the Express server
   - Set `NODE_ENV=production`
   - Configure environment variables

#### Frontend + Backend

Deploy the static frontend to Vercel with `VITE_API_BASE_URL` pointing to your backend.

### Troubleshooting Vercel Deployment

If you see a blank white screen on Vercel, try these steps:

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for errors in the Console tab
   - Common issues: 404 errors for assets, CORS errors, JavaScript errors

2. **Verify Build Output**
   - Check the Vercel deployment logs
   - Ensure build completed successfully
   - Verify `dist/public` contains `index.html` and `/assets` folder

3. **Check Vercel Configuration**
   - Go to Vercel Project Settings → General
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`
   - **Framework Preset**: Other (or Vite)

4. **Clear Cache and Redeploy**
   - In Vercel, go to Deployments
   - Click "..." on latest deployment → Redeploy
   - Check "Clear Build Cache & Redeploy"

5. **Test Build Locally**
   ```bash
   npm run build
   cd dist/public
   python3 -m http.server 8000
   ```
   Visit `http://localhost:8000` to verify the build works

6. **Check Environment Variables**
   - If `VITE_API_BASE_URL` is set but pointing to a non-existent backend, remove it
   - For static demo mode, leave it unset
   - Redeploy after changing environment variables

7. **Common Fixes**
   - Ensure `vercel.json` exists in project root
   - Check that `client/public/data/*.json` files exist
   - Verify Node.js version is 20+ in Vercel settings
   - Try deploying from a fresh commit

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000  # For local development
# VITE_API_BASE_URL=https://your-api.com # For production with separate backend
```

**Important**: 
- Leave `VITE_API_BASE_URL` empty for static demo mode
- Set it to your backend URL for full functionality

## Project Structure

```
.
├── client/              # React frontend
│   ├── public/
│   │   └── data/       # Static fallback JSON files
│   └── src/
│       ├── components/ # UI components
│       ├── pages/      # Route pages
│       └── lib/        # Utilities (includes API helper)
├── server/             # Express backend
│   ├── index.ts       # Server entry point
│   ├── routes.ts      # API routes
│   ├── storage.ts     # In-memory data store
│   └── gemini.ts      # AI integration
├── shared/            # Shared types and schemas
└── vercel.json       # Vercel deployment config
```

## API Fallback System

The app includes an intelligent API fallback system:

1. **With API** (`VITE_API_BASE_URL` set):
   - Tries backend API first
   - Falls back to static data on network error
   - Full read/write functionality

2. **Without API** (static mode):
   - Serves pre-generated JSON from `/data`
   - Read-only mode with disabled submit buttons
   - Perfect for demos and previews

Static data files location: `client/public/data/`

## Technologies

- **Frontend**: React, TypeScript, TailwindCSS, Wouter, TanStack Query
- **Backend**: Express, TypeScript
- **AI**: Google Gemini
- **Build**: Vite, esbuild
- **Deployment**: Vercel (frontend), Replit/Railway/Render (backend)

## License

MIT
