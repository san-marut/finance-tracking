import { Category } from '../models/finance.models';

const sub = (id: string, name: string) => ({ id, name });

/** แท็กเริ่มต้น 2 ระดับ ผู้ใช้แก้ไข/เพิ่ม/ลบได้ในหน้า "แท็ก" */
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'exp-food',
    kind: 'expense',
    name: 'อาหารและเครื่องดื่ม',
    icon: '🍜',
    color: '#f97316',
    children: [
      sub('exp-food-breakfast', 'อาหารเช้า'),
      sub('exp-food-lunch', 'อาหารกลางวัน'),
      sub('exp-food-dinner', 'อาหารเย็น'),
      sub('exp-food-cafe', 'กาแฟ/ขนม'),
      sub('exp-food-delivery', 'สั่งเดลิเวอรี'),
    ],
  },
  {
    id: 'exp-travel',
    kind: 'expense',
    name: 'เดินทาง',
    icon: '🚗',
    color: '#0ea5e9',
    children: [
      sub('exp-travel-fuel', 'น้ำมัน'),
      sub('exp-travel-public', 'รถสาธารณะ'),
      sub('exp-travel-taxi', 'แท็กซี่/เรียกรถ'),
      sub('exp-travel-park', 'ทางด่วน/ที่จอดรถ'),
    ],
  },
  {
    id: 'exp-goods',
    kind: 'expense',
    name: 'ข้าวของเครื่องใช้',
    icon: '🧺',
    color: '#8b5cf6',
    children: [
      sub('exp-goods-home', 'ของใช้ในบ้าน'),
      sub('exp-goods-appliance', 'เครื่องใช้ไฟฟ้า'),
      sub('exp-goods-cloth', 'เสื้อผ้า/รองเท้า'),
      sub('exp-goods-stationery', 'เครื่องเขียน'),
    ],
  },
  {
    id: 'exp-home',
    kind: 'expense',
    name: 'ที่พักอาศัย',
    icon: '🏠',
    color: '#14b8a6',
    children: [
      sub('exp-home-rent', 'ค่าเช่า/ผ่อนบ้าน'),
      sub('exp-home-water', 'ค่าน้ำ'),
      sub('exp-home-power', 'ค่าไฟ'),
      sub('exp-home-net', 'เน็ต/โทรศัพท์'),
    ],
  },
  {
    id: 'exp-invest',
    kind: 'expense',
    name: 'การลงทุน',
    icon: '📈',
    color: '#22c55e',
    children: [
      sub('exp-invest-fund', 'กองทุนรวม'),
      sub('exp-invest-stock', 'หุ้น'),
      sub('exp-invest-gold', 'ทองคำ'),
      sub('exp-invest-crypto', 'คริปโต'),
      sub('exp-invest-saving', 'ประกันออมทรัพย์'),
    ],
  },
  {
    id: 'exp-health',
    kind: 'expense',
    name: 'สุขภาพ',
    icon: '💊',
    color: '#ec4899',
    children: [
      sub('exp-health-hospital', 'ค่ารักษาพยาบาล'),
      sub('exp-health-med', 'ยา/วิตามิน'),
      sub('exp-health-fitness', 'ฟิตเนส/กีฬา'),
    ],
  },
  {
    id: 'exp-fun',
    kind: 'expense',
    name: 'ความบันเทิง',
    icon: '🎮',
    color: '#a855f7',
    children: [
      sub('exp-fun-trip', 'ท่องเที่ยว'),
      sub('exp-fun-movie', 'หนัง/คอนเสิร์ต'),
      sub('exp-fun-subscribe', 'ค่าสมาชิกรายเดือน'),
      sub('exp-fun-game', 'เกม'),
    ],
  },
  {
    id: 'exp-edu',
    kind: 'expense',
    name: 'การศึกษา',
    icon: '📚',
    color: '#3b82f6',
    children: [sub('exp-edu-course', 'คอร์สเรียน'), sub('exp-edu-book', 'หนังสือ')],
  },
  {
    id: 'exp-other',
    kind: 'expense',
    name: 'อื่นๆ',
    icon: '🧾',
    color: '#64748b',
    children: [
      sub('exp-other-fee', 'ค่าธรรมเนียม'),
      sub('exp-other-donate', 'บริจาค'),
      sub('exp-other-misc', 'เบ็ดเตล็ด'),
    ],
  },
  {
    id: 'inc-salary',
    kind: 'income',
    name: 'รายได้ประจำ',
    icon: '💼',
    color: '#10b981',
    children: [
      sub('inc-salary-main', 'เงินเดือน'),
      sub('inc-salary-bonus', 'โบนัส'),
      sub('inc-salary-ot', 'ค่าล่วงเวลา'),
    ],
  },
  {
    id: 'inc-side',
    kind: 'income',
    name: 'รายได้เสริม',
    icon: '🛠️',
    color: '#06b6d4',
    children: [sub('inc-side-freelance', 'ฟรีแลนซ์'), sub('inc-side-sell', 'ขายของ')],
  },
  {
    id: 'inc-invest',
    kind: 'income',
    name: 'ผลตอบแทนการลงทุน',
    icon: '📊',
    color: '#84cc16',
    children: [
      sub('inc-invest-dividend', 'เงินปันผล'),
      sub('inc-invest-interest', 'ดอกเบี้ย'),
      sub('inc-invest-gain', 'กำไรจากการขาย'),
    ],
  },
  {
    id: 'inc-other',
    kind: 'income',
    name: 'อื่นๆ',
    icon: '🎁',
    color: '#eab308',
    children: [sub('inc-other-gift', 'ของขวัญ/เงินได้พิเศษ'), sub('inc-other-refund', 'เงินคืน')],
  },
];

/**
 * แท็กย่อยที่นับเป็น "มื้ออาหาร" สำหรับค่าอาหารเฉลี่ยต่อวันในแดชบอร์ด
 * เทียบทั้ง id ของแท็กเริ่มต้นและชื่อ เผื่อผู้ใช้ลบแล้วสร้างใหม่เอง (id จะไม่เหมือนเดิม)
 */
export const MEALS: ReadonlyArray<{ label: string; id: string }> = [
  { label: 'อาหารเช้า', id: 'exp-food-breakfast' },
  { label: 'อาหารกลางวัน', id: 'exp-food-lunch' },
  { label: 'อาหารเย็น', id: 'exp-food-dinner' },
];

/** จานสีสำหรับตอนสร้างแท็กใหม่ */
export const PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b',
];

export const ICON_CHOICES = [
  '🍜', '☕', '🚗', '🚌', '🏠', '💡', '🧺', '👕', '💊', '🏥', '📈', '💰',
  '🎮', '🎬', '✈️', '📚', '🐶', '🎁', '🧾', '💼', '🛠️', '📊', '💳', '🍺',
];
