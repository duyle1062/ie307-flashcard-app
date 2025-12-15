import { Colors } from "../constants/Color";

export const getStatusColor = (
  value: number,
  type: "new" | "learning" | "review"
): string => {
  if (value === 0) return Colors.gray;
  if (type === "new") return Colors.blue;
  if (type === "learning") return Colors.red;
  if (type === "review") return Colors.green;
  return Colors.gray;
};
