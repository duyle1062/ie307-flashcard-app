# 🔥 Firestore Setup Guide

## ⚠️ Cần fix ngay

Bạn đang gặp 2 lỗi chính:

1. **Firestore Rules**: Missing or insufficient permissions
2. **Firestore Indexes**: Queries require indexes

---

## 🔐 Bước 1: Cập nhật Firestore Rules

### Truy cập Firebase Console

1. Vào https://console.firebase.google.com
2. Chọn project: **ie307-flashcard-app**
3. Menu bên trái: **Firestore Database** → **Rules**

### ⭐ Copy Rule này vào Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function: Check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function: Check if user owns the resource
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Allow read/write only for the user's own document
      allow read, write: if isOwner(userId);
    }

    // Collections
    match /collections/{collectionId} {
      // Allow read if user owns the collection
      allow read: if isSignedIn() && resource.data.user_id == request.auth.uid;

      // Allow create if user sets themselves as owner
      allow create: if isSignedIn() && request.resource.data.user_id == request.auth.uid;

      // Allow update/delete if user owns the collection
      allow update, delete: if isSignedIn() && resource.data.user_id == request.auth.uid;
    }

    // Cards - FIXED: Cards ownership qua parent collection
    match /cards/{cardId} {
      // Helper: Get collection_id from incoming or existing data
      function getCollectionId() {
        return request.resource.data.collection_id != null
          ? request.resource.data.collection_id
          : resource.data.collection_id;
      }

      // Helper: Check if user owns the parent collection
      function ownsParentCollection() {
        return isSignedIn() &&
          get(/databases/$(database)/documents/collections/$(getCollectionId())).data.user_id == request.auth.uid;
      }

      // Allow read if user owns the parent collection
      allow read: if isSignedIn() &&
        get(/databases/$(database)/documents/collections/$(resource.data.collection_id)).data.user_id == request.auth.uid;

      // Allow create/update/delete if user owns parent collection
      allow create, update, delete: if ownsParentCollection();
    }

    // Reviews
    match /reviews/{reviewId} {
      // Allow read/write only for the user's own reviews
      allow read: if isSignedIn() && resource.data.user_id == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.user_id == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.user_id == request.auth.uid;
    }
  }
}
```

**⚠️ LƯU Ý QUAN TRỌNG:**

- **Cards** KHÔNG CÓ `user_id` field
- Cards ownership được xác định qua **parent collection**
- Rule phải fetch parent collection để check `user_id`
- Đây là lý do Rules phức tạp hơn cho Cards

### Publish Rules

Bấm nút **"Publish"** để áp dụng rules mới.

---

## 📊 Bước 2: Tạo Firestore Indexes

Firestore cần indexes cho các query phức tạp. Có 2 cách:

### Cách 1: Tự động (Khuyến nghị) ⭐

Click vào các link trong error logs:

1. **Collections index**:

   ```
   https://console.firebase.google.com/v1/r/project/ie307-flashcard-app/firestore/indexes?create_composite=...
   ```

   → Click link → Bấm "Create Index"

2. **Cards index**: Click link tương tự
3. **Reviews index**: Click link tương tự

**Lưu ý**: Index mất 5-10 phút để build.

### Cách 2: Thủ công

1. Vào Firebase Console → **Firestore Database** → **Indexes**
2. Bấm **"Create Index"**
3. Tạo các indexes sau:

#### Index cho Collections

- **Collection ID**: `collections`
- **Fields**:
  - `user_id` (Ascending)
  - `updated_at` (Ascending)

#### Index cho Cards

- **Collection ID**: `cards`
- **Fields**:
  - `user_id` (Ascending)
  - `updated_at` (Ascending)

#### Index cho Reviews

- **Collection ID**: `reviews`
- **Fields**:
  - `user_id` (Ascending)
  - `updated_at` (Ascending)

---

## ⚡ Bước 3: Tạm thời disable Pull (Optional)

Nếu muốn test ngay mà chưa setup indexes, tạm thời disable PULL:

Trong `syncService.ts`, comment dòng:

```typescript
// await this.pullFromCloud(userId); // Tạm thời disable
```

---

## ✅ Kiểm tra sau khi fix

1. **Test Firestore Rules**:

   ```typescript
   // Trong Firebase Console → Firestore → Rules → Tab "Simulator"
   // Test read user document
   ```

2. **Test Indexes**:

   - Đợi 5-10 phút
   - Chạy lại app
   - Check logs không còn error "requires an index"

3. **Test Sync**:
   ```typescript
   // Xem console logs
   ✅ Push complete: X synced, 0 failed
   ✅ Pull complete: X records synced
   ✅ Sync complete
   ```

---

## 🐛 Troubleshooting

### Vẫn còn "Missing permissions"?

- Confirm đã publish rules
- Logout/login lại app
- Check `request.auth.uid` trong rules tab

### Vẫn còn "Missing index"?

- Đợi index build xong (5-10 phút)
- Check tab "Indexes" để xem status
- Nếu "Error", xóa và tạo lại

### Sync vẫn fail?

- Check network connectivity
- Check Firebase project settings
- Review console logs chi tiết

---

## 📝 Notes

- **Rules** protect data security
- **Indexes** optimize query performance
- Cả 2 đều REQUIRED cho production
- Dev/test có thể tạm disable pull để test push

---

**Next**: Sau khi fix, test lại app và check logs!
