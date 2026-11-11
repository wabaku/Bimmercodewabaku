# BimmerTech Studio — Android APK Build Project

Because compiling a signed Android `.apk` binary requires the Android SDK, Gradle, and Java 17 (which cannot run directly inside a browser sandbox), this project is pre-configured with **Capacitor 6**, **Native BLE OBD-II Services**, and an automated **GitHub Actions APK Builder** so you can get your `.apk` in **two ways**:

---

## Option 1: Zero-Install Cloud APK Build (GitHub Actions — Easiest)
You don't need to install Android Studio on your computer:
1. Create a free repository on **GitHub** and upload the contents of this ZIP folder.
2. Click the **Actions** tab in your GitHub repository.
3. The **"Build Android APK"** workflow (`.github/workflows/build-apk.yml`) will automatically run in the cloud.
4. Once finished (~2 minutes), scroll to **Artifacts** and download **`BimmerTech-Studio-Debug-APK.zip`** containing **`app-debug.apk`**, ready to install on your Android phone!

---

## Option 2: Local Build on Your PC / Mac
If you have Node.js and Android Studio installed locally:

```bash
# 1. Install dependencies
npm install

# 2. Build the React application
npm run build

# 3. Generate and sync the native Android project
npx cap add android
npx cap sync android

# 4. Copy Bluetooth permissions from ANDROID_PERMISSIONS.xml into:
#    android/app/src/main/AndroidManifest.xml

# 5. Build the APK via Gradle (or open in Android Studio with `npm run android:open`)
cd android
./gradlew assembleDebug
```

Your installable `.apk` file will be output to:
`android/app/build/outputs/apk/debug/app-debug.apk`
