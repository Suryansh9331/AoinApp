# 🔧 Fix DEVELOPER_ERROR for Google Sign In

## Your SHA-1 Fingerprint

```
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

## Quick Fix Steps

### Step 1: Add SHA-1 to Google Cloud Console

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project (the one with Client ID: `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l`)

2. **Navigate to Credentials:**
   - Go to **APIs & Services** > **Credentials**
   - Find your **OAuth 2.0 Client ID** for Android
   - If you don't have one, create a new OAuth 2.0 Client ID for Android

3. **Add SHA-1 Fingerprint:**
   - Click **Edit** on your Android OAuth 2.0 Client ID
   - Scroll down to **SHA certificate fingerprints**
   - Click **+ ADD FINGERPRINT**
   - Paste: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - Click **Save**

### Step 2: Verify Client ID Type

Make sure you're using the **Web Client ID** (not Android Client ID) in your code.

Your current Client ID: `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com`

This should be:
- ✅ **Web Client ID** - Used in `webClientId` configuration
- ❌ **Android Client ID** - Not used in React Native Google Sign In

### Step 3: Verify Package Name

Your Android package name: `com.aoinapp`

Make sure this matches in Google Cloud Console:
- In your Android OAuth 2.0 Client ID settings
- Package name should be: `com.aoinapp`

### Step 4: Rebuild the App

After adding SHA-1 to Google Cloud Console:

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

**Important:** Wait 5-10 minutes after adding SHA-1 for Google's servers to update, then rebuild.

---

## Common Issues

### Issue 1: Still Getting DEVELOPER_ERROR After Adding SHA-1

**Solution:**
- Wait 5-10 minutes for Google's servers to update
- Make sure you added SHA-1 to the **Android** OAuth 2.0 Client ID (not iOS or Web)
- Verify the SHA-1 is exactly: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- Rebuild the app completely (clean build)

### Issue 2: Wrong Client ID Type

**Solution:**
- Make sure you're using **Web Client ID** in `src/utils/Routes.js`
- The Client ID should end with `.apps.googleusercontent.com`
- Don't use Android Client ID for `webClientId` configuration

### Issue 3: Package Name Mismatch

**Solution:**
- Verify package name in `android/app/build.gradle` is `com.aoinapp`
- Verify this matches in Google Cloud Console OAuth 2.0 Client ID settings

---

## Verification Checklist

Before testing again, verify:

- [ ] SHA-1 fingerprint added to Google Cloud Console
- [ ] Using Web Client ID (not Android Client ID)
- [ ] Package name matches (`com.aoinapp`)
- [ ] Waited 5-10 minutes after adding SHA-1
- [ ] Rebuilt the app completely
- [ ] Testing on a real device (not emulator)

---

## Still Having Issues?

1. **Double-check SHA-1:**
   ```powershell
   cd android
   .\get-sha1.ps1
   ```
   Make sure it matches: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

2. **Check Google Cloud Console:**
   - Verify OAuth consent screen is configured
   - Verify APIs are enabled (Google Sign-In API)

3. **Clear and Rebuild:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native start --reset-cache
   npx react-native run-android
   ```

---

## Your Current Configuration

- **Package Name:** `com.aoinapp`
- **SHA-1:** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **Client ID:** `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com`

Make sure all of these match in Google Cloud Console!

