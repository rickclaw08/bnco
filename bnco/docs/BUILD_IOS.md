# BNCO iOS Build Guide

Complete instructions for building, signing, and submitting BNCO to the App Store.

## Prerequisites

### Required Software
- **macOS** 13.0+ (Ventura or later)
- **Xcode** 15.0+ (install from Mac App Store)
- **Xcode Command Line Tools**: `xcode-select --install`
- **CocoaPods**: `sudo gem install cocoapods`
- **Node.js** 18+ and npm

### Required Accounts
- **Apple Developer Program** ($99/year) - https://developer.apple.com/programs/
- **App Store Connect** access - https://appstoreconnect.apple.com

## Project Setup

### 1. Install Dependencies

```bash
cd app
npm install
```

This installs Vite, Capacitor, and all required plugins.

### 2. Build the Web App

```bash
npx vite build
```

Outputs to `app/dist/`.

### 3. Sync with Capacitor

```bash
npx cap sync ios
```

This copies the web build into the native iOS project and installs CocoaPods dependencies.

### 4. Open in Xcode

```bash
npx cap open ios
```

This opens the `ios/App/App.xcworkspace` file in Xcode.

## Xcode Configuration

### Bundle Identifier
The app is configured with bundle ID: `studio.bnco.app`

### Signing Setup

1. In Xcode, select the **App** target
2. Go to **Signing & Capabilities** tab
3. Check **Automatically manage signing**
4. Select your **Team** (your Apple Developer account)
5. Xcode will create provisioning profiles automatically

If you need manual signing:
1. Go to https://developer.apple.com/account/resources/profiles/list
2. Create an **App ID** with bundle ID `studio.bnco.app`
3. Create a **Distribution** provisioning profile
4. Download and install it
5. Select it in Xcode under Signing & Capabilities

### Deployment Target
Set the minimum iOS version to **15.0** for broad device coverage.

### App Icons
1. Run the icon generator: `node scripts/generate-icons.js`
2. Open `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
3. Replace the placeholder icons with generated PNGs
4. The 1024x1024 icon goes in the App Store slot

### Splash Screen
Capacitor's SplashScreen plugin is configured with:
- Background: `#F5F0EB` (BNCO cream)
- Auto-hide on launch
- No spinner

To customize further, edit `ios/App/App/Assets.xcassets/Splash.imageset/`.

## Building for Distribution

### 1. Set Build Configuration

In Xcode:
1. Select **Product > Scheme > Edit Scheme**
2. Set **Run** configuration to **Release**

### 2. Archive the App

1. Select target device as **Any iOS Device (arm64)**
2. Go to **Product > Archive**
3. Wait for the build to complete
4. The Organizer window opens with your archive

### 3. Validate the Archive

1. In the Organizer, select your archive
2. Click **Validate App**
3. Follow the prompts (select distribution method, signing options)
4. Fix any validation errors before proceeding

### 4. Upload to App Store Connect

1. In the Organizer, click **Distribute App**
2. Select **App Store Connect**
3. Select **Upload**
4. Follow the prompts for signing
5. Wait for the upload to complete

## App Store Connect Configuration

### Create App Listing

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** > **+** > **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** BNCO
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** studio.bnco.app
   - **SKU:** bnco-ios-v1

### App Information

Use the metadata files in `ios-metadata/`:

- **Description:** Copy from `description.txt`
- **Keywords:** Copy from `keywords.txt` (100 char max)
- **What's New:** Copy from `release-notes.txt`
- **Support URL:** `https://bnco.studio/support`
- **Privacy Policy URL:** Host `privacy-policy.md` at `https://bnco.studio/privacy`

### App Rating

BNCO should qualify for **4+** rating:
- No violence
- No mature content
- Health/fitness category
- Social features (leaderboards)

### Category
- **Primary:** Health & Fitness
- **Secondary:** Sports

### Pricing
- **Price:** Free

### Screenshots

See `ios-metadata/screenshots-guide.md` for detailed dimensions and capture instructions.

Upload screenshots for:
- iPhone 6.7" display (required)
- iPhone 6.5" display (required)
- iPhone 5.5" display (required)
- iPad Pro 12.9" (optional)

### App Review Information

Provide demo credentials if your app requires login:
- **First Name:** BNCO
- **Last Name:** Review
- **Email:** support@bnco.studio
- Create a demo account in the app for the review team

### App Privacy

In App Store Connect, go to **App Privacy** and declare:
- **Health & Fitness:** Collected, linked to user identity (for RES scoring)
- **Identifiers:** User ID, device ID
- **Usage Data:** Product interaction
- **Contact Info:** Email address (for account)

## TestFlight Distribution

### Internal Testing
1. In App Store Connect, go to your app > **TestFlight**
2. Your uploaded build appears under **Builds**
3. Add internal testers (up to 25) under **Internal Testing**
4. Testers receive an email to install via TestFlight app

### External Testing
1. Create a **New External Testing Group**
2. Add the build to the group
3. Submit for **Beta App Review** (required for external testers)
4. After approval, add testers by email or share the public link
5. Up to 10,000 external testers

### TestFlight Tips
- Builds expire after 90 days
- Add release notes for each build so testers know what changed
- Monitor crash reports and feedback in App Store Connect

## Submitting for Review

1. Complete all required metadata, screenshots, and privacy info
2. Select your build under **Build** section
3. Click **Add for Review**
4. Answer the review questions
5. Click **Submit for Review**

### Review Timeline
- Typical review: 24-48 hours
- First submission may take longer
- Common rejection reasons:
  - Missing privacy policy
  - Incomplete metadata
  - Crashes or bugs
  - Login issues for review team

## Quick Reference Commands

```bash
# Full build pipeline
chmod +x ios-build.sh
./ios-build.sh

# Individual steps
npx vite build           # Build web app
npx cap sync ios         # Sync to iOS
npx cap open ios         # Open in Xcode

# Generate icons
node scripts/generate-icons.js

# Update native project after config changes
npx cap update ios
```

## Troubleshooting

### Pod install fails
```bash
cd ios/App
pod install --repo-update
```

### White screen on launch
- Verify `dist/` contains built files
- Check Capacitor config `webDir` points to `dist`
- Run `npx cap sync ios` again

### Signing issues
- Ensure Apple Developer membership is active
- Check that bundle ID matches in Xcode and capacitor.config.ts
- Try revoking and regenerating certificates in Xcode preferences

### Build fails with module errors
```bash
cd ios/App
pod deintegrate
pod install
```
