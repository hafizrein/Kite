# Firebase Deployment Guide

This guide will help you deploy your Next.js application to Firebase App Hosting.

**Important**: Your app uses Server Actions and other dynamic features that require server-side rendering, so **Firebase App Hosting** is the only suitable option.

## Prerequisites

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Verify your project**:
   ```bash
   firebase projects:list
   ```
   Make sure `kite-ndagf` is listed and set as default.

4. **For App Hosting**: Enable billing on your Firebase project
   - Go to [Firebase Console](https://console.firebase.google.com/project/kite-ndagf/usage/details)
   - Upgrade to the Blaze (pay-as-you-go) plan
   - App Hosting requires billing but has a generous free tier

## Environment Variables Setup

Before deploying, you need to set up your environment variables:

### For Firebase Hosting (Static)
Create a `.env.local` file in your project root with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kite-ndagf.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kite-ndagf
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kite-ndagf.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
```

### For Firebase App Hosting (Full-stack)
Set environment variables in Firebase console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`kite-ndagf`)
3. Go to **App Hosting** → **Environment Variables**
4. Add the same environment variables as above

## Deployment Steps

### Firebase App Hosting (Required for Your App)

This is the best option for full Next.js applications with server-side features.

**Requirements:**
- Billing must be enabled on your Firebase project
- Upgrade to Blaze plan at: https://console.firebase.google.com/project/kite-ndagf/usage/details

**Steps:**

1. **Initialize App Hosting** (after enabling billing):
   ```bash
   firebase init apphosting
   ```

2. **Deploy**:
   ```bash
   npm run deploy:apphosting
   ```
   
   Or manually:
   ```bash
   firebase deploy
   ```

3. **Your app will be available at**: A URL provided after deployment

**Pros:**
- Full Next.js support
- Server-side rendering
- API routes work
- Environment variables
- Automatic scaling
- Built-in CI/CD

**Cons:**
- More complex setup
- May have cold starts

## Configuration Files Explained

### `firebase.json`
- Configures both hosting and app hosting
- Sets up rewrites for SPA behavior
- Defines what files to ignore

### `apphosting.yaml`
- Configures App Hosting settings
- Sets maximum instances (currently 1)
- Can be customized for scaling

### `next.config.ts`
- Updated with export configuration
- Image optimization disabled for static export
- Trailing slashes enabled for better compatibility

## Troubleshooting

### Common Issues:

1. **Build Errors**: Make sure all environment variables are set correctly
2. **404 Errors**: Check that rewrites are configured in `firebase.json`
3. **API Routes Not Working**: Use App Hosting instead of regular Hosting
4. **Environment Variables**: Ensure they're set in Firebase console for App Hosting

### Commands for Debugging:

```bash
# Check Firebase project
firebase projects:list

# Test local build
npm run build

# Check Firebase CLI version
firebase --version

# View deployment logs
firebase apphosting:logs
```

## Next Steps After Deployment

1. **Set up custom domain** (optional):
   - Go to Firebase Console → Hosting → Add custom domain

2. **Monitor performance**:
   - Check Firebase Console → Performance tab

3. **Set up analytics** (optional):
   - Enable Google Analytics in Firebase Console

4. **Configure security rules**:
   - Set up Firestore security rules if using database features

## Quick Reference Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Deploy to Firebase Hosting (static)
npm run deploy:hosting

# Deploy to Firebase App Hosting (full-stack)
npm run deploy:apphosting

# View logs
firebase apphosting:logs

# Open Firebase console
firebase open
```

Choose **Firebase App Hosting** for the best experience with your Next.js application!
