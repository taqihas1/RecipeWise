# 🔐 Android Production Signing Setup - RecipeWise

## ⚠️ CRITICAL WARNING

**The keystore file (`recipewise-release.keystore`) is the ONLY key to your app's identity on Google Play.**

- If you lose it → you CANNOT update your app ever again
- If someone steals it → they can publish fake updates to your app
- **Keep it safe. Back it up. Never share it.**

---

## 📋 What You Need to Do (5 Minutes)

### Step 1: Add GitHub Secrets (REQUIRED)

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

Add these 4 secrets:

| Secret Name | Value | How to Get It |
|-------------|-------|---------------|
| `ANDROID_KEYSTORE_BASE64` | *(see below)* | Run `node scripts/generate-keystore-secret.js` locally |
| `ANDROID_KEYSTORE_PASSWORD` | `recipewise123` | From this document |
| `ANDROID_KEY_ALIAS` | `recipewise-key` | From this document |
| `ANDROID_KEY_PASSWORD` | `recipewise123` | From this document |

**To get the base64 value:**
```bash
cd recipewise
node scripts/generate-keystore-secret.js
```
Copy the long output and paste it into the GitHub Secret.

---

### Step 2: Download & Save Keystore Locally

The file `recipewise-release.keystore` is in your repo root (but NOT committed to Git). **Download it immediately and store it safely:**

- External USB drive
- Password manager (1Password, Bitwarden)
- Encrypted cloud storage
- **Multiple locations!**

---

### Step 3: Build Production AAB (When Ready)

After you've tested the preview build and everything works:

**Option A: EAS Build (Recommended - uses Expo signing)**
1. Upload keystore to EAS:
   ```bash
   eas credentials
   # Select: Android → Production → Upload keystore
   ```
2. Run the existing EAS workflow from GitHub Actions
3. Download signed AAB from Expo

**Option B: Direct GitHub Build (uses keystore from GitHub Secrets)**
1. Go to GitHub → Actions → **"Android Production Build - Signed AAB"**
2. Click **Run workflow**
3. Select `aab` (or `apk` for testing)
4. Click **Run workflow**
5. Download signed AAB from Artifacts (appears after build completes)

---

## 🔧 Keystore Details

```
File: recipewise-release.keystore
Alias: recipewise-key
Store Password: recipewise123
Key Password: recipewise123
Valid: 10,000 days (~27 years)
Algorithm: RSA 2048-bit
```

---

## 🚨 What NOT to Do

❌ **Never commit the keystore to Git**  
❌ **Never share the password in messages**  
❌ **Never lose the keystore file**  
❌ **Never use debug.keystore for production**

✅ **Do store in password manager**  
✅ **Do backup to multiple locations**  
✅ **Do use GitHub Secrets (not repo files)**  
✅ **Do test signing with APK before AAB**

---

## 📱 Google Play Upload Checklist

Before uploading to Google Play:
- [ ] Preview build tested and approved
- [ ] Keystore safely stored
- [ ] GitHub Secrets configured
- [ ] `app-ads.txt` configured (if using ads)
- [ ] Privacy policy URL added
- [ ] App screenshots prepared
- [ ] App description written
- [ ] Content rating questionnaire completed

---

## 🔄 If You Lose the Keystore

You CANNOT recover. You must:
1. Create a new app listing on Google Play
2. Use a new package name (e.g., `com.recipewise.app.v2`)
3. All existing users must reinstall

**Don't let this happen. Back up your keystore TODAY.**
