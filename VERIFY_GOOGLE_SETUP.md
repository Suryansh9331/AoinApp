# ✅ Verify Google Sign In Setup

## Current Status

Your app is configured correctly, but you need to complete the Google Cloud Console setup.

## Step-by-Step Verification

### ✅ Step 1: Verify SHA-1 Fingerprint

Your SHA-1 fingerprint is:
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**Action Required:** Add this to Google Cloud Console.

---

### ✅ Step 2: Verify Client ID Type

**Current Client ID in code:**
```
968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com
```

**Important:** This should be a **Web Client ID** (not Android Client ID).

**How to verify:**
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Find this Client ID: `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l`
3. Check the **Application type** - it should be **"Web application"**
4. If it's "Android application", you need to create a **Web Client ID** instead

**Why?** React Native Google Sign In uses `webClientId`, which requires a Web Client ID, not an Android Client ID.

---

### ✅ Step 3: Verify Package Name

**Your Android package name:**
```
com.aoinapp
```

**Action Required:** Make sure this matches in Google Cloud Console.

---

### ✅ Step 4: Complete Google Cloud Console Setup

#### A. Create/Verify OAuth 2.0 Client IDs

You need **TWO** OAuth 2.0 Client IDs:

1. **Web Client ID** (for React Native code)
   - Application type: **Web application**
   - Client ID: `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com`
   - This is what you use in `webClientId` configuration

2. **Android Client ID** (for SHA-1 fingerprint)
   - Application type: **Android**
   - Package name: `com.aoinapp`
   - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

#### B. Add SHA-1 to Android Client ID

1. Go to Google Cloud Console
2. APIs & Services > Credentials
3. Find your **Android** OAuth 2.0 Client ID
4. Click **Edit**
5. Under **SHA certificate fingerprints**, click **+ ADD FINGERPRINT**
6. Paste: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
7. Click **Save**

#### C. Verify OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Make sure it's configured (at least in Testing mode)
3. Add test users if in Testing mode

---

### ✅ Step 5: Enable Required APIs

Make sure these APIs are enabled:
1. **Google Sign-In API** (or **Google+ API**)
2. **Google Identity Toolkit API** (if available)

To enable:
1. Go to **APIs & Services** > **Library**
2. Search for "Google Sign-In"
3. Click **Enable**

---

### ✅ Step 6: Wait and Rebuild

**Important Timeline:**
1. After adding SHA-1, wait **5-10 minutes** for Google's servers to update
2. Then rebuild the app completely:

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## Common Mistakes

### ❌ Mistake 1: Using Android Client ID for webClientId

**Wrong:**
- Using Android Client ID in `webClientId` configuration

**Correct:**
- Use **Web Client ID** for `webClientId`
- Use **Android Client ID** only for SHA-1 fingerprint

### ❌ Mistake 2: Adding SHA-1 to Wrong Client ID

**Wrong:**
- Adding SHA-1 to Web Client ID

**Correct:**
- Add SHA-1 to **Android Client ID** only

### ❌ Mistake 3: Not Waiting After Adding SHA-1

**Wrong:**
- Adding SHA-1 and immediately testing

**Correct:**
- Wait 5-10 minutes after adding SHA-1
- Then rebuild and test

### ❌ Mistake 4: Package Name Mismatch

**Wrong:**
- Package name in code: `com.aoinapp`
- Package name in Google Cloud: `com.aoinapp2`

**Correct:**
- Both must match exactly: `com.aoinapp`

---

## Verification Checklist

Before testing again, check:

- [ ] SHA-1 fingerprint added to **Android** OAuth 2.0 Client ID
- [ ] Using **Web Client ID** in code (not Android Client ID)
- [ ] Package name matches exactly: `com.aoinapp`
- [ ] OAuth consent screen is configured
- [ ] Google Sign-In API is enabled
- [ ] Waited 5-10 minutes after adding SHA-1
- [ ] Rebuilt app completely (clean build)
- [ ] Testing on real device (not emulator)

---

## Still Getting DEVELOPER_ERROR?

### Debug Steps:

1. **Verify SHA-1 again:**
   ```powershell
   cd android
   .\get-sha1.ps1
   ```
   Make sure it's still: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

2. **Check Google Cloud Console:**
   - Go to Credentials
   - Verify Android OAuth 2.0 Client ID has the SHA-1
   - Verify Web OAuth 2.0 Client ID exists
   - Check that package name is `com.aoinapp`

3. **Verify Client ID in code:**
   - Open `src/utils/Routes.js`
   - Verify `GOOGLE_CLIENT_ID` is the **Web Client ID**
   - It should end with `.apps.googleusercontent.com`

4. **Clear everything and rebuild:**
   ```bash
   # Clear Metro cache
   npx react-native start --reset-cache
   
   # In another terminal:
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   cd ..
   npx react-native run-android
   ```

5. **Check logs for more details:**
   - Look for any other error messages
   - Check if Google Play Services is available

---

## Expected Behavior After Fix

Once everything is configured correctly:

1. Click "Continue with Google"
2. Google Sign In dialog appears
3. Select Google account
4. Grant permissions
5. Successfully authenticated
6. Redirected to appropriate screen

---

## Need Help?

If you've completed all steps and still getting errors:

1. Double-check all items in the verification checklist
2. Verify in Google Cloud Console that everything matches
3. Try creating a new OAuth 2.0 Client ID if needed
4. Check React Native Google Sign In docs: https://react-native-google-signin.github.io/docs/

