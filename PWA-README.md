# PWA Setup for Pet Track

This app is now configured as a Progressive Web App (PWA). Here's what has been added:

## Files Created:

1. **`public/manifest.json`** - PWA manifest file
2. **`public/sw.js`** - Service worker for offline functionality
3. **`public/icon.svg`** - Placeholder icon (needs to be replaced with actual icons)
4. **`src/components/feat/ServiceWorkerRegister.tsx`** - Service worker registration component

## What was updated:

1. **`src/app/layout.tsx`** - Added PWA metadata and service worker registration
2. **`next.config.ts`** - Added headers for service worker and manifest

## Next Steps:

### 1. Create Real Icons

You need to create actual app icons. You can:
- Use an online tool like PWA Asset Generator
- Use the provided `generate-icons.sh` script (requires ImageMagick or librsvg2)
- Manually create icons in these sizes:
  - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### 2. Test PWA Functionality

1. **Install the PWA:**
   - Open the app in Chrome
   - Look for the install icon in the address bar
   - Click "Install" to add to home screen

2. **Test Offline:**
   - Install the PWA
   - Go offline
   - Try accessing the app (basic functionality should work)

3. **Test App-like Experience:**
   - Open from home screen
   - Should launch in standalone mode
   - No browser UI visible

### 3. Verify PWA Checklist

- [ ] Serves over HTTPS
- [ ] Web App Manifest is valid
- [ ] Service worker is registered
- [ ] Icons of various sizes are provided
- [ ] App works offline
- [ ] App has proper splash screen
- [ ] App has theme color

## PWA Features Enabled:

✅ **Installable** - Can be installed to home screen
✅ **Offline Support** - Basic offline functionality via service worker
✅ **App-like Experience** - Runs in standalone mode
✅ **Responsive Design** - Works on all device sizes
✅ **Linkable** - Can be shared via URL

## Service Worker Features:

- Caches essential files for offline access
- Provides fallback when network is unavailable
- Updates cache when new version is available

## Notes:

- The service worker uses a cache-first strategy for performance
- Network requests are cached automatically for faster subsequent loads
- The app will prompt users to install when criteria are met
- You can customize the offline experience further if needed