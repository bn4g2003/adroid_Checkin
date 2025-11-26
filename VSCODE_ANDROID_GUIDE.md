# Build Android App với VSCode

## Yêu cầu tối thiểu
1. **Android Studio** - chỉ cần cài 1 lần để có Android SDK
   - Tải: https://developer.android.com/studio
   - Sau khi cài, mở Android Studio > More Actions > SDK Manager
   - Cài Android SDK (API 33 trở lên)
   - Nhớ đường dẫn SDK (thường là `C:\Users\YourName\AppData\Local\Android\Sdk`)

2. **Java JDK 17+**
   - Tải: https://adoptium.net/
   - Hoặc dùng: `choco install openjdk17` (nếu có Chocolatey)

## Setup môi trường (chỉ làm 1 lần)

### 1. Tạo file `android/local.properties`
```
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```
*Thay `YourUsername` bằng tên user Windows của bạn*

### 2. Set biến môi trường (optional nhưng nên có)
Thêm vào System Environment Variables:
```
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot
```

Thêm vào PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

## Workflow phát triển trong VSCode

### Build và test trên Android
```bash
# 1. Build web app
npm run build

# 2. Sync với Android
npm run cap:sync

# 3. Chạy trên thiết bị/emulator đã kết nối
npm run cap:run:android
```

### Hoặc từng bước riêng
```bash
# Build web
npm run build

# Sync
npx cap sync

# List devices
cd android
./gradlew tasks
cd ..

# Build APK debug
cd android
./gradlew assembleDebug
cd ..
```

APK sẽ ở: `android/app/build/outputs/apk/debug/app-debug.apk`

## Cài APK lên điện thoại

### Cách 1: Dùng ADB (nhanh nhất)
```bash
# Kiểm tra thiết bị đã kết nối
adb devices

# Cài APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Hoặc cài đè lên app cũ
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Cách 2: Copy file APK
- Copy file `app-debug.apk` vào điện thoại
- Mở file và cài đặt (cần bật "Install from unknown sources")

## Kết nối thiết bị Android

### Qua USB
1. Bật **Developer Options** trên điện thoại:
   - Settings > About phone > Tap "Build number" 7 lần
2. Bật **USB Debugging**:
   - Settings > Developer options > USB debugging
3. Kết nối USB và chọn "File Transfer" mode
4. Chạy `adb devices` để kiểm tra

### Qua WiFi (không cần dây)
```bash
# Lần đầu cần USB
adb tcpip 5555
adb connect <IP_ĐIỆN_THOẠI>:5555

# Sau đó có thể rút dây
adb devices
```

## VSCode Extensions hữu ích

Cài các extension này:
- **Android iOS Emulator** - Chạy emulator từ VSCode
- **Gradle for Java** - Hỗ trợ Gradle
- **React Native Tools** - Debug React (tương thích với Capacitor)

## Scripts hữu ích thêm vào package.json

```json
"scripts": {
  "android:build": "npm run build && npx cap sync && cd android && ./gradlew assembleDebug && cd ..",
  "android:install": "adb install -r android/app/build/outputs/apk/debug/app-debug.apk",
  "android:run": "npm run android:build && npm run android:install",
  "android:log": "adb logcat | grep -i capacitor"
}
```

## Debug trong VSCode

### Xem logs
```bash
# Xem tất cả logs
adb logcat

# Chỉ xem logs của app
adb logcat | findstr "Capacitor"

# Hoặc dùng Chrome DevTools
# Mở chrome://inspect trong Chrome browser
```

## Build APK Release (Production)

### 1. Tạo keystore
```bash
keytool -genkey -v -keystore checkin-release-key.keystore -alias checkin -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Tạo `android/key.properties`
```
storePassword=your_password
keyPassword=your_password  
keyAlias=checkin
storeFile=../checkin-release-key.keystore
```

### 3. Sửa `android/app/build.gradle`
Thêm trước `android {`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Thêm trong `android { ... }`:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 4. Build release
```bash
cd android
./gradlew assembleRelease
cd ..
```

APK release ở: `android/app/build/outputs/apk/release/app-release.apk`

## Troubleshooting

### Lỗi "SDK location not found"
→ Tạo file `android/local.properties` như hướng dẫn ở trên

### Lỗi "JAVA_HOME not set"
→ Set biến môi trường JAVA_HOME

### Lỗi "adb not found"
→ Thêm Android SDK platform-tools vào PATH

### Lỗi Gradle
```bash
cd android
./gradlew clean
cd ..
npm run cap:sync
```

### App crash khi mở
→ Xem logs: `adb logcat | findstr "Capacitor"`
→ Thường do Firebase config hoặc permissions

## Tóm tắt workflow nhanh

```bash
# Phát triển web bình thường
npm run dev

# Khi muốn test trên Android
npm run build
npm run cap:sync
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Hoặc dùng 1 lệnh
npm run cap:run:android
```

Không cần mở Android Studio nữa! 🎉
