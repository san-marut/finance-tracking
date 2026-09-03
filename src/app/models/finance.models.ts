/** ประเภทของรายการ: รายรับ หรือ รายจ่าย */
export type TxKind = 'income' | 'expense';

/** แท็กระดับที่ 2 เช่น "อาหารกลางวัน" ที่อยู่ใต้ "อาหารและเครื่องดื่ม" */
export interface SubCategory {
  id: string;
  name: string;
}

/** แท็กระดับที่ 1 เช่น "อาหารและเครื่องดื่ม" */
export interface Category {
  id: string;
  kind: TxKind;
  name: string;
  icon: string;
  color: string;
  children: SubCategory[];
}

/** รายการรับ/จ่าย 1 รายการ */
export interface Transaction {
  id: string;
  kind: TxKind;
  /** จำนวนเงิน เก็บเป็นค่าบวกเสมอ ทิศทางดูจาก kind */
  amount: number;
  /** วันที่แบบ YYYY-MM-DD */
  date: string;
  categoryId: string;
  subCategoryId: string | null;
  note: string;
  createdAt: string;
}

/** โครงสร้างข้อมูลทั้งหมดที่เก็บลง localStorage */
export interface FinanceData {
  version: number;
  categories: Category[];
  transactions: Transaction[];
}

/** ยอดสรุปของช่วงเวลาหนึ่ง */
export interface Summary {
  income: number;
  expense: number;
  balance: number;
  count: number;
}

/** ยอดรวมแยกตามแท็กระดับ 1 พร้อมยอดย่อยระดับ 2 */
export interface CategoryStat {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  percent: number;
  count: number;
  children: SubCategoryStat[];
}

export interface SubCategoryStat {
  subCategoryId: string;
  name: string;
  total: number;
  percent: number;
  count: number;
}

/** ยอดค่าอาหารแยกตามมื้อ */
export interface MealSummary {
  total: number;
  count: number;
  meals: { label: string; total: number; count: number }[];
}

/** ยอดรวมรายเดือนสำหรับกราฟแนวโน้ม */
export interface MonthlyPoint {
  month: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
}
