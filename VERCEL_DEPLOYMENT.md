# Vercel Deployment Guide for CoachMe360

## Quick Fix for Blank White Screen

If you're seeing a blank white screen, follow these steps:

### Step 1: Verify Build Settings in Vercel

1. Go to your project in Vercel
2. Click **Settings** → **General**
3. Scroll to **Build & Development Settings**
4. Configure as follows:
   - **Framework Preset**: `Other` (or `Vite`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

### Step 2: Check Environment Variables

1. Go to **Settings** → **Environment Variables**
2. **For static demo mode (recommended first):**
   - Remove `VITE_API_BASE_URL` if it exists
   - Or leave it empty
3. **For full functionality with backend:**
   - Set `VITE_API_BASE_URL` to your backend URL
   - Example: `https://your-backend.railway.app`

### Step 3: Clear Cache and Redeploy

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **three dots** (...) menu
4. Select **Redeploy**
5. ✅ **Check "Use existing Build Cache"** to UNCHECK it (clear cache)
6. Click **Redeploy**

### Step 4: Check Browser Console

While the deployment is running:

1. Open your Vercel deployment URL
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Look for errors (red text)

Common errors and solutions:

| Error | Solution |
|-------|----------|
| `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"` | Output directory is wrong. Should be `dist/public` |
| `404` errors for `/assets/*.js` | Build didn't complete. Check build logs |
| `Uncaught TypeError` or React errors | Clear cache and redeploy |
| Nothing loads at all | Check Network tab for 404 on `index.html` |

### Step 5: Verify Build Logs

1. In Vercel, click on the deployment
2. View the **Build Logs**
3. Look for:
   ```
   ✓ built in XXs
   ```
4. Ensure no errors appear

## Vercel Configuration File

Your project includes a `vercel.json` file with the correct configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Do not modify this file** unless you know what you're doing.

## Testing Locally Before Deploying

To ensure your build works before deploying to Vercel:

```bash
# Build the project
npm run build

# Test the built files with a local server
cd dist/public
python3 -m http.server 8000

# Visit http://localhost:8000 in your browser
```

If it works locally but not on Vercel, the issue is with Vercel configuration.

## Node.js Version

Ensure Vercel is using Node.js 20 or higher:

1. Go to **Settings** → **General**
2. Under **Node.js Version**, select `20.x`
3. Redeploy

## Static Demo Mode

When deployed without a backend:

- ✅ You can view all pages and demo data
- ✅ Dashboard shows charts and statistics
- ✅ All navigation works
- ❌ Submit buttons are disabled (read-only mode)
- ❌ No AI features (requires backend with GEMINI_API_KEY)

## Full Functionality Mode

To enable AI features and data submission:

1. Deploy your Express backend separately:
   - **Replit**: Use the built-in deployment
   - **Railway**: `railway up`
   - **Render**: Connect your repo
   - **Fly.io**: `fly deploy`

2. Set environment variables in Vercel:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

3. Redeploy

The app will automatically detect the backend and enable all features.

## Still Having Issues?

### Debug Checklist

- [ ] Build command is `npm run build`
- [ ] Output directory is `dist/public`
- [ ] Node.js version is 20.x
- [ ] No `VITE_API_BASE_URL` environment variable (for static mode)
- [ ] Cleared build cache
- [ ] Checked browser console for errors
- [ ] Verified `vercel.json` exists in project root
- [ ] Build logs show successful completion

### Get Help

1. **Check Build Logs**: Look for any warnings or errors
2. **Browser Console**: Open DevTools and check Console/Network tabs
3. **Vercel Functions**: This is a static site, ensure no serverless functions are being created
4. **Fresh Deploy**: Try deploying from a new commit

### Common Solutions

**Problem**: Blank white screen
**Solution**: Usually a build configuration issue. Double-check output directory is `dist/public`

**Problem**: 404 on all routes except home
**Solution**: `vercel.json` rewrites not working. Ensure the file exists in project root

**Problem**: Assets not loading
**Solution**: Build didn't complete successfully. Check build logs and try clearing cache

**Problem**: Data not showing
**Solution**: Check that `dist/public/data/` contains JSON files after build

## Success Indicators

When deployment is successful, you should see:

1. ✅ Build completes without errors
2. ✅ Deployment shows "Ready" status
3. ✅ Opening the URL shows the CoachMe360 dashboard
4. ✅ Navigation between pages works
5. ✅ Charts and data are visible
6. ✅ No errors in browser console

If all these are true, your deployment is successful! 🎉
