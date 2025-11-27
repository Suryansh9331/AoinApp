# 🚀 Quick Fix for DEVELOPER_ERROR

## ⚠️ Current Error
```
DEVELOPER_ERROR (Code: 10)
```

## ✅ Solution - 3 Simple Steps

### Step 1: Get Your SHA-1 (Already Done ✅)
```
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

### Step 2: Add SHA-1 to Google Cloud Console

1. **Open Google Cloud Console:**
   - https://console.cloud.google.com/
   - Select your project

2. **Go to Credentials:**
   - Click: **APIs & Services** → **Credentials**

3. **Find or Create Android OAuth 2.0 Client ID:**
   - Look for Client ID: `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l`
   - If you see "Web application" type, you need to create an **Android** one
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Select **Android** as application type
   - Package name: `com.aoinapp`
   - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - Click **Create**

4. **OR Edit Existing Android Client ID:**
   - Find your Android OAuth 2.0 Client ID
   - Click **Edit** (pencil icon)
   - Scroll to **SHA certificate fingerprints**
   - Click **+ ADD FINGERPRINT**
   - Paste: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - Click **Save**

### Step 3: Wait & Rebuild

1. **Wait 5-10 minutes** (Google servers need time to update)

2. **Rebuild the app:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

---

## ⚠️ Important: Two Client IDs Needed

You need **TWO** OAuth 2.0 Client IDs:

### 1. Web Client ID (Already in your code ✅)
- **Type:** Web application
- **Client ID:** `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com`
- **Used in:** `src/utils/Routes.js` → `GOOGLE_CLIENT_ID`
- **Purpose:** Used by React Native Google Sign In

### 2. Android Client ID (Need to add SHA-1 here ⚠️)
- **Type:** Android
- **Package name:** `com.aoinapp`
- **SHA-1:** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **Purpose:** Validates your app's identity

---

## ✅ Verification Checklist

After completing the steps, verify:

- [ ] Android OAuth 2.0 Client ID exists in Google Cloud Console
- [ ] SHA-1 fingerprint is added to Android Client ID
- [ ] Package name is `com.aoinapp` in Android Client ID
- [ ] Web Client ID exists (for code)
- [ ] Waited 5-10 minutes after adding SHA-1
- [ ] Rebuilt app completely (clean build)
- [ ] Testing on real device (not emulator)

---

## 🔍 Still Not Working?

### Check These:

1. **Verify SHA-1 is correct:**
   ```powershell
   cd android
   .\get-sha1.ps1
   ```
   Should show: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

2. **Verify in Google Cloud Console:**
   - Go to Credentials
   - Check Android OAuth 2.0 Client ID
   - Verify SHA-1 is there
   - Verify package name is `com.aoinapp`

3. **Clear and rebuild:**
   ```bash
   # Stop Metro bundler
   # Then:
   cd android
   ./gradlew clean
   cd ..
   npx react-native start --reset-cache
   # In another terminal:
   npx react-native run-android
   ```

---

## 📝 Summary

**What you need to do:**
1. Add SHA-1 to Android OAuth 2.0 Client ID in Google Cloud Console
2. Wait 5-10 minutes
3. Rebuild app

**Your details:**
- SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- Package: `com.aoinapp`
- Web Client ID: `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com`

---

For detailed troubleshooting, see: `VERIFY_GOOGLE_SETUP.md`

