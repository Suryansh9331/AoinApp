# 📋 Step-by-Step Fix for DEVELOPER_ERROR

## Current Status
- ✅ Code is configured correctly
- ✅ SHA-1 fingerprint extracted: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- ❌ SHA-1 not added to Google Cloud Console (or added incorrectly)

---

## 🔧 Complete Fix - Follow These Steps Exactly

### Step 1: Open Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Make sure you're in the **correct project**
3. The project should have Client ID: `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l`

---

### Step 2: Navigate to Credentials

1. In the left sidebar, click **APIs & Services**
2. Click **Credentials**
3. You should see a list of OAuth 2.0 Client IDs

---

### Step 3: Check Existing Client IDs

Look for these Client IDs:

**A. Web Client ID** (Should exist ✅)
- Type: **Web application**
- Client ID: `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com`
- This is what you use in your code

**B. Android Client ID** (May or may not exist ⚠️)
- Type: **Android**
- Package name: `com.aoinapp`
- SHA-1: Should have `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

---

### Step 4: Create or Edit Android Client ID

#### Option A: If Android Client ID EXISTS

1. Find the **Android** OAuth 2.0 Client ID
2. Click the **Edit icon** (pencil) next to it
3. Scroll down to **SHA certificate fingerprints**
4. Click **+ ADD FINGERPRINT**
5. Paste: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
6. Click **SAVE** at the bottom

#### Option B: If Android Client ID DOES NOT EXIST

1. Click **+ CREATE CREDENTIALS** at the top
2. Select **OAuth client ID**
3. In the popup:
   - **Application type:** Select **Android**
   - **Name:** Enter `AoinApp Android` (or any name)
   - **Package name:** Enter `com.aoinapp`
   - **SHA-1 certificate fingerprint:** Enter `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
4. Click **CREATE**
5. You'll see a confirmation - click **OK**

---

### Step 5: Verify the Setup

After creating/editing, verify:

1. **Android Client ID exists** with:
   - ✅ Package name: `com.aoinapp`
   - ✅ SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

2. **Web Client ID exists** with:
   - ✅ Client ID: `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com`

---

### Step 6: Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search for **"Google Sign-In API"**
3. If not enabled, click **ENABLE**
4. Also search for **"Google Identity Toolkit API"** and enable it

---

### Step 7: Wait for Google to Update

**IMPORTANT:** After adding SHA-1, wait **5-10 minutes** for Google's servers to update.

You can check the time:
- Note the time when you saved the SHA-1
- Wait at least 5 minutes before testing

---

### Step 8: Rebuild the App

After waiting 5-10 minutes:

```bash
# Stop the current app if running

# Clean build
cd android
./gradlew clean

# Go back to root
cd ..

# Rebuild
npx react-native run-android
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: Adding SHA-1 to Web Client ID
- **Wrong:** Adding SHA-1 to Web application Client ID
- **Correct:** Add SHA-1 to **Android** Client ID only

### ❌ Mistake 2: Wrong Package Name
- **Wrong:** Package name in Google Cloud: `com.aoinapp2` or `com.aoinapp.debug`
- **Correct:** Must be exactly: `com.aoinapp`

### ❌ Mistake 3: Wrong SHA-1 Format
- **Wrong:** `5E8F16062EA3CD2C4A0D547876BAA6F38CABF625` (no colons)
- **Correct:** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` (with colons)

### ❌ Mistake 4: Not Waiting
- **Wrong:** Testing immediately after adding SHA-1
- **Correct:** Wait 5-10 minutes, then rebuild

### ❌ Mistake 5: Not Rebuilding
- **Wrong:** Just restarting the app
- **Correct:** Clean build required: `./gradlew clean` then rebuild

---

## ✅ Verification Checklist

Before testing, make sure:

- [ ] Android OAuth 2.0 Client ID exists in Google Cloud Console
- [ ] Package name is exactly `com.aoinapp` (no extra characters)
- [ ] SHA-1 is exactly `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` (with colons)
- [ ] Web Client ID exists (for code)
- [ ] Google Sign-In API is enabled
- [ ] Waited 5-10 minutes after adding SHA-1
- [ ] Did clean build: `./gradlew clean`
- [ ] Rebuilt app completely
- [ ] Testing on real device (emulator may have issues)

---

## 🔍 Still Getting Error?

### Debug Steps:

1. **Double-check SHA-1:**
   ```powershell
   cd android
   .\get-sha1.ps1
   ```
   Verify it matches: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

2. **Verify in Google Cloud Console:**
   - Go to Credentials
   - Find Android OAuth 2.0 Client ID
   - Click Edit
   - Verify:
     - Package name: `com.aoinapp`
     - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - If anything is wrong, fix it and save

3. **Check OAuth Consent Screen:**
   - Go to **OAuth consent screen**
   - Make sure it's configured (at least Testing mode)
   - Add test users if in Testing mode

4. **Clear Everything:**
   ```bash
   # Clear Metro cache
   npx react-native start --reset-cache
   
   # In another terminal:
   cd android
   ./gradlew clean
   rm -rf app/build
   cd ..
   npx react-native run-android
   ```

---

## 📞 Need More Help?

If you've completed all steps and still getting error:

1. Take a screenshot of your Google Cloud Console Credentials page
2. Verify the Android Client ID shows:
   - Package name: `com.aoinapp`
   - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
3. Make sure you waited 5-10 minutes
4. Try creating a completely new Android OAuth 2.0 Client ID

---

## 🎯 Quick Reference

**Your Details:**
- Package Name: `com.aoinapp`
- SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- Web Client ID: `968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com`

**What to do:**
1. Create/Edit Android OAuth 2.0 Client ID
2. Add SHA-1 fingerprint
3. Wait 5-10 minutes
4. Clean build and rebuild



