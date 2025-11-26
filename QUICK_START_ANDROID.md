# Quick Start - Build Android App

## Đã hoàn thành ✅
- Cài đặt Capacitor
- Tạo project Android
- Cấu hình build

## Bước tiếp theo

### 1. Cài Android Studio
Tải và cài đặt: https://developer.android.com/studio

### 2. Build và test
```bash
# Build web app
npm run build

# Sync với Android
npm run cap:sync

# Mở Android Studio
npm run cap:open:android
```

### 3. Trong Android Studio
- Đợi Gradle sync xong
- Kết nối điện thoại Android (bật USB debugging) hoặc tạo emulator
- Click nút ▶️ Run để cài app lên thiết bị

## Thông tin app
- **App ID**: com.checkin.app
- **App Name**: Checkin App
- **Web Dir**: dist

## Xem thêm
Chi tiết đầy đủ trong file `ANDROID_BUILD_GUIDE.md`
