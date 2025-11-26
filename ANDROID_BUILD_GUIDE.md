# Hướng dẫn Build App Android với Capacitor

## Yêu cầu
- Node.js và npm đã cài đặt ✅
- Android Studio (tải tại: https://developer.android.com/studio)
- Java JDK 17 hoặc cao hơn

## Các bước build app

### 1. Build web app
```bash
npm run build
```

### 2. Sync code với Android
```bash
npm run cap:sync
```

### 3. Mở project trong Android Studio
```bash
npm run cap:open:android
```

### 4. Build APK trong Android Studio
- Chọn **Build > Build Bundle(s) / APK(s) > Build APK(s)**
- File APK sẽ được tạo trong `android/app/build/outputs/apk/debug/`

### 5. Hoặc chạy trực tiếp trên thiết bị/emulator
```bash
npm run cap:run:android
```

## Cấu hình quan trọng

### App ID và tên
Chỉnh sửa trong `capacitor.config.json`:
```json
{
  "appId": "com.checkin.app",
  "appName": "Checkin App"
}
```

### Icon và Splash Screen
- Đặt icon tại: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Đặt splash screen tại: `android/app/src/main/res/drawable/splash.png`

### Permissions
Chỉnh sửa `android/app/src/main/AndroidManifest.xml` để thêm quyền:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
```

## Workflow phát triển

1. Chỉnh sửa code web như bình thường
2. Test trên browser: `npm run dev`
3. Khi muốn test trên Android:
   ```bash
   npm run build
   npm run cap:sync
   npm run cap:run:android
   ```

## Lưu ý
- Mỗi lần thay đổi code web, cần chạy `npm run build` và `npm run cap:sync`
- Firebase config sẽ hoạt động bình thường trên Android
- Để build APK release (production), cần tạo keystore và cấu hình signing

## Build APK Release (Production)

### 1. Tạo keystore
```bash
keytool -genkey -v -keystore checkin-release-key.keystore -alias checkin -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Cấu hình signing
Tạo file `android/key.properties`:
```
storePassword=your_password
keyPassword=your_password
keyAlias=checkin
storeFile=../checkin-release-key.keystore
```

### 3. Build release APK
Trong Android Studio: **Build > Generate Signed Bundle / APK**

## Troubleshooting

### Lỗi "SDK location not found"
Tạo file `android/local.properties`:
```
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

### Lỗi Gradle
```bash
cd android
./gradlew clean
cd ..
npm run cap:sync
```
