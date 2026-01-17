<p align="center">
  <a href="https://www.uit.edu.vn/" title="Trường Đại học Công nghệ Thông tin" style="border: none;">
    <img src="https://i.imgur.com/WmMnSRt.png" alt="Trường Đại học Công nghệ Thông tin | University of Information Technology">
  </a>
</p>

<h1 align="center"><b>CÔNG NGHỆ LẬP TRÌNH ĐA NỀN TẢNG CHO ỨNG DỤNG DI ĐỘNG</b></h1>

## THÀNH VIÊN NHÓM:

| STT | MSSV     | Họ và Tên         | Email |
| --- | -------- | ----------------- | -------------------------------- |
| 1   | 22520315 | Lê Đức Anh Duy    | 22520315@gm.uit.edu.vn |
| 2   | 22520198 | Đỗ Thành Danh     | 22520198@gm.uit.edu.vn |
| 3   | 22520309 | Phạm Hải Dương    | 22520309@gm.uit.edu.vn |
| 4   | 22520316 | Lê Thanh Duy      | 22520316@gm.uit.edu.vn |

## GIỚI THIỆU MÔN HỌC
* **Tên môn học:** Công nghệ lập trình đa nền tảng cho ứng dụng di động
* **Mã môn học:** IE307
* **Mã lớp:** IE307.Q12
* **Năm học:** HK1 (2025 - 2026)
* **Giảng viên hướng dẫn:** ThS. Phạm Nhật Duy

## ĐỀ TÀI: FLASHCARD APP
Ứng dụng Flashcard trên thiết bị di động hỗ trợ học tập và ghi nhớ kiến thức thông qua phương pháp **Spaced Repetition (Lặp lại ngắt quãng)**. Ứng dụng được thiết kế theo kiến trúc **Offline-first**, cho phép học mọi lúc mọi nơi và tự động đồng bộ dữ liệu khi có kết nối mạng.

## TÍNH NĂNG NỔI BẬT 

### Quản lý học tập
* **CRUD Collection/Card:** Tạo, sửa, xóa bộ thẻ và thẻ học. Hỗ trợ import/export dữ liệu dạng CSV/JSON.
* **Spaced Repetition System (SRS):** Sử dụng thuật toán SM-2 tùy chỉnh để tính toán thời điểm ôn tập.
* **Study Modes:** Hỗ trợ các trạng thái thẻ: New (Mới), Learning (Đang học), Review (Ôn tập).

### Công cụ hỗ trợ
* **OCR:** Quét văn bản từ ảnh để tạo thẻ. Hỗ trợ scan Offline (ML Kit) và Online (Google Cloud Vision API).
* **Offline-first:** Cơ sở dữ liệu SQLite cục bộ đóng vai trò là nguồn dữ liệu chính, đảm bảo trải nghiệm không cần internet.
* **Sync Data:** Đồng bộ 2 chiều với Firestore, xử lý xung đột và hàng đợi khi có mạng.

### Thống kê
* **Statistics:** Biểu đồ thống kê lượt ôn tập, tỷ lệ nhớ, thẻ khó nhất.
* **Streak:** Theo dõi chuỗi ngày học liên tiếp để duy trì động lực.
* **Dark/Light Mode:** Giao diện trực quan, hỗ trợ chế độ tối.

## CÔNG NGHỆ SỬ DỤNG 

| Category | Technology | Description |
| --- | --- | --- |
| **Framework** | **React Native / Expo SDK** | Nền tảng phát triển ứng dụng đa nền tảng. |
| **Language** | **TypeScript** | Đảm bảo an toàn kiểu dữ liệu và dễ bảo trì. |
| **Local DB** | **Expo SQLite** | Lưu trữ dữ liệu offline (Users, Collections, Cards...). |
| **Cloud DB** | **Firebase Firestore** | Lưu trữ đám mây và đồng bộ dữ liệu. |
| **Auth** | **Firebase Auth** | Xác thực người dùng (Email/Password). |
| **State** | **React Context / Hooks** | Quản lý trạng thái ứng dụng. |
| **UI/UX** | **Reanimated / Gesture Handler** | Xử lý Animation và thao tác cử chỉ. |
| **OCR** | **ML Kit / Google Vision** | Nhận diện văn bản từ hình ảnh. |

## CẤU TRÚC THƯ MỤC
```
ie307-flashcard-app/
├── assets/                          # Tài nguyên tĩnh
├── src/
│   ├── components/                  # Component UI tái sử dụng 
│   ├── core/                        # Cấu hình cốt lõi
│   │   └── config/
│   │       └── firebaseConfig.ts    # Cấu hình Firebase 
│   ├── database/                    # Quản lý SQLite Local 
│   │   ├── repositories/            # Data access layer
│   │   │   ├── CardRepository.ts      
│   │   │   ├── CollectionRepository.ts 
│   │   │   ├── ReviewRepository.ts    
│   │   │   └── UserRepository.ts      
│   │   ├── database.ts              # Khởi tạo database 
│   │   ├── schema.ts                # Định nghĩa schema bảng 
│   │   ├── helpers.ts               # Các hàm hỗ trợ database 
│   │   ├── spacedRepetition.ts      # Thuật toán SM-2 (SRS) 
│   │   ├── storage.ts               # AsyncStorage wrapper 
│   │   └── types.ts                 # Các định nghĩa kiểu dữ liệu DB 
│   ├── features/                    # Modules chức năng
│   │   ├── card/                    # Quản lý thẻ flashcard 
│   │   ├── collection/              # Quản lý bộ thẻ 
│   │   ├── ocr/                     # Nhận dạng văn bản từ ảnh
│   │   ├── sync/                    # Đồng bộ dữ liệu
│   │   ├── usage/                   # Thống kê & phân tích 
│   │   └── user/                    # Quản lý người dùng 
│   ├── navigation/                  # Cấu hình điều hướng màn hình 
│   ├── screens/                     # Các màn hình chính của ứng dụng 
│   ├── shared/                      # Tài nguyên dùng chung 
│   │   ├── constants/               # Hằng số (màu sắc, config) 
│   │   ├── context/                 # React Context
│   │   ├── hooks/                   # Custom hooks chung 
│   │   ├── i18n/                    # Cài đặt đa ngôn ngữ 
│   │   ├── types/                   # TypeScript types chung 
│   │   └── utils/                   # Các tiện ích khác 
│   └── App.tsx                      # Root component
├── app.json                         # Cấu hình Expo
├── index.js                         # Entry point
├── package.json                     # Dependencies
└── tsconfig.json                    # Cấu hình TypeScript
```
## CÀI ĐẶT & CẤU HÌNH
### Yêu cầu
* Node.js
* Expo Go hoặc Android Emulator

### Các bước thực hiện
#### 1. Clone Repository
```
git clone https://github.com/duyle1062/ie307-flashcard-app.git
cd ie307-flashcard-app
```
#### 2. Cài đặt Dependencies
```
npm install
# Hoặc sử dụng yarn
yarn install
```
#### 3. Cấu hình biến môi trường
Tạo tệp .env tại thư mục gốc và điền thông tin cấu hình từ Firebase Console và Google Cloud:
```
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Cloud Vision API (Cho tính năng OCR Online)
EXPO_PUBLIC_GOOGLE_VISION_API_KEY=your_google_vision_api_key
```
#### 4. Cài đặt EAS CLI
```
npm install -g eas-cli
```
#### 5. Đăng nhập vào Expo
```
eas login
```
#### 6. Build cho Android (APK/AAB)
```
# Build bản phát triển
eas build --profile development --platform android

# Build bản chính thức
eas build --profile production --platform android
```
#### 7. Khởi chạy ứng dụng
```
npx expo start -c
```

## TÀI LIỆU THAM KHẢO
* EAS BUILD: https://docs.expo.dev/build/setup/
