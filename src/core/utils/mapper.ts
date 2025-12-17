/**
 * Mapper: Chuyển đổi dữ liệu giữa Local (SQLite) và Cloud (Firestore)
 */

// 1. Chuyển từ Local -> Cloud (loại bỏ ID ra)
export const toFirestoreData = (entityType: string, localData: any) => {
  const cloudData = { ...localData };

  // Xóa ID (vì dùng làm Document Key)
  if (cloudData.id) delete cloudData.id;

  return cloudData;
};

// 2. Chuyển từ Cloud -> Local (thêm ID vào)
export const fromFirestoreData = (entityType: string, docId: string, firestoreData: any) => {
  const localData = { 
    id: docId,
    ...firestoreData 
  };

  return localData;
};