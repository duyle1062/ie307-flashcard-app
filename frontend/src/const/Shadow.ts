import { Colors } from "./Color";

export const Shadows = {
  // Level 1: Dùng cho các nút nhỏ, hoặc trạng thái hover nhẹ
  light: {
    shadowColor: Colors.title, 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, 
  },

  // Level 2: CHUẨN - Dùng cho Card, SearchBar
  medium: {
    shadowColor: Colors.title,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4, 
  },

  // Level 3: Dùng cho Floating Button (nút Add), Modal, Alert
  strong: {
    shadowColor: Colors.title,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, 
    shadowRadius: 16,
    elevation: 8, 
  },
};