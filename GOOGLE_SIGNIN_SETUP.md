# Google Sign In Setup Guide

This guide will help you complete the Google Sign In setup for both Android and iOS.

## Prerequisites

- Google Sign In package is already installed: `@react-native-google-signin/google-signin`
- Google Client ID: `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com`
- Google Login API URL: `https://api.aoinstore.com/api/auth/google`

---

## Android Setup

### Step 1: Get SHA-1 Certificate Fingerprint

You need to add your app's SHA-1 fingerprint to Google Cloud Console.

#### Option A: Using the provided script (Windows PowerShell)
```powershell
cd android
.\get-sha1.ps1
```

#### Option B: Using the provided script (Linux/Mac)
```bash
cd android
chmod +x get-sha1.sh
./get-sha1.sh
```

#### Option C: Manual method
```bash
cd android
keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Look for the `SHA1:` line and copy the fingerprint (it looks like: `AA:BB:CC:DD:...`)

### Step 2: Add SHA-1 to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 Client ID (or create one if it doesn't exist)
5. Click **Edit**
6. Under **SHA certificate fingerprints**, click **+ ADD FINGERPRINT**
7. Paste your SHA-1 fingerprint
8. Click **Save**

### Step 3: Verify Android Configuration

The following files have been configured:
- ✅ `android/app/build.gradle` - Auto-linking will handle dependencies
- ✅ `android/app/src/main/AndroidManifest.xml` - Internet permission is already present

### Step 4: Rebuild Android App

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## iOS Setup

### Step 1: Install CocoaPods Dependencies

**Note:** This must be done on macOS with CocoaPods installed.

```bash
cd ios
pod install
cd ..
```

If you don't have CocoaPods installed:
```bash
sudo gem install cocoapods
```

### Step 2: Verify iOS Configuration

The following files have been configured:
- ✅ `ios/AoinApp/Info.plist` - URL scheme added for Google Sign In
- ✅ `ios/AoinApp/AppDelegate.mm` - URL handling for Google Sign In callbacks

### Step 3: Configure Google Sign In in Xcode

1. Open `ios/AoinApp.xcworkspace` in Xcode (not `.xcodeproj`)
2. Go to your project target > **Info** tab
3. Verify that the URL scheme is present:
   - URL Types should include: `com.googleusercontent.apps.968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l`

### Step 4: Add iOS Bundle ID to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 Client ID for iOS
5. Add your iOS Bundle ID (found in Xcode project settings)
6. Save the changes

### Step 5: Rebuild iOS App

```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

---

## Testing Google Sign In

### Test Flow

1. Open the app
2. Navigate to **Sign Up** screen
3. Click **Continue with Google**
4. Google Sign In dialog should appear
5. Select your Google account
6. Grant permissions
7. You should be redirected to the appropriate screen based on your role

### Troubleshooting

#### Android Issues

**Error: "DEVELOPER_ERROR" or "10:"**
- Make sure SHA-1 fingerprint is added to Google Cloud Console
- Verify the OAuth 2.0 Client ID matches your `GOOGLE_CLIENT_ID`
- Rebuild the app after adding SHA-1

**Error: "Network Error"**
- Check internet permission in AndroidManifest.xml (already configured)
- Verify the API URL is correct

#### iOS Issues

**Error: "The operation couldn't be completed"**
- Make sure you ran `pod install`
- Verify URL scheme in Info.plist
- Check that Bundle ID matches Google Cloud Console configuration

**Error: "No valid client ID"**
- Verify `GOOGLE_CLIENT_ID` in `src/utils/Routes.js`
- Check that the client ID is configured for iOS in Google Cloud Console

#### General Issues

**Package not found error**
- Make sure `@react-native-google-signin/google-signin` is installed:
  ```bash
  npm install @react-native-google-signin/google-signin
  ```

**Autolinking issues**
- Clear cache and rebuild:
  ```bash
  cd android && ./gradlew clean && cd ..
  cd ios && pod deintegrate && pod install && cd ..
  npx react-native start --reset-cache
  ```

---

## Code Implementation

The Google Sign In functionality is already implemented in:
- `src/utils/GoogleSignIn.js` - Core Google Sign In logic
- `src/auth/Register/SelectSignUpMethod.js` - Sign up with Google
- `src/components/reuseable/GoogleButton.js` - Google button component

### Usage

The Google Sign In will automatically:
1. Configure with your `GOOGLE_CLIENT_ID`
2. Handle authentication flow
3. Send token to your backend API (`ROUTES.GOOGLE_LOGIN`)
4. Store user data and token in Redux
5. Navigate based on user role

---

## Additional Notes

### For Production Builds

**Android:**
- Generate a release keystore
- Get SHA-1 from release keystore
- Add release SHA-1 to Google Cloud Console

**iOS:**
- Use your production Bundle ID
- Configure in Google Cloud Console
- Test with TestFlight or App Store build

### Security

- Never commit your release keystore or keystore passwords
- Keep your `GOOGLE_CLIENT_ID` secure
- Use environment variables for sensitive data in production

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all configurations match this guide
3. Check Google Cloud Console for any errors
4. Review React Native Google Sign In documentation: https://github.com/react-native-google-signin/google-signin

