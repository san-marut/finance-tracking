const TH_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

export const TH_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

const TH_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

/** สร้าง id แบบสุ่มที่ไม่ชนกัน */
export function uid(prefix = 'id'): string {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rnd}`;
}

/** วันที่วันนี้ในรูปแบบ YYYY-MM-DD (อิงเวลาท้องถิ่น) */
export function todayIso(): string {
  return toIsoDate(new Date());
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** เลื่อนวัน เช่น shiftDay('2569-08-28', -1) => '2569-08-27' */
export function shiftDay(isoDate: string, delta: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return toIsoDate(new Date(y, m - 1, d + delta));
}

/** จำนวนวันจาก from ถึง to (ไม่นับวันเริ่ม) */
export function daysBetween(from: string, to: string): number {
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  const ms = new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime();
  return Math.round(ms / 86_400_000);
}

/** YYYY-MM ของเดือนปัจจุบัน */
export function currentMonth(): string {
  return todayIso().slice(0, 7);
}

export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** เลื่อนเดือน เช่น shiftMonth('2026-01', -1) => '2025-12' */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}`;
}

/** 'สิงหาคม 2569' (พ.ศ.) */
export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${TH_MONTHS[m - 1]} ${y + 543}`;
}

/** 'ส.ค. 69' สำหรับแกนกราฟ */
export function monthLabelShort(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${TH_MONTHS_SHORT[m - 1]} ${`${y + 543}`.slice(2)}`;
}

/** แยกส่วนเดือน/ปีสำหรับแกนกราฟ เช่น { m: 'ส.ค.', y: '69' } */
export function monthTick(month: string): { m: string; y: string } {
  const [y, m] = month.split('-').map(Number);
  return { m: TH_MONTHS_SHORT[m - 1], y: `${y + 543}`.slice(2) };
}

/** '22 ส.ค. 2569' */
export function dateLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${d} ${TH_MONTHS_SHORT[m - 1]} ${y + 543}`;
}

/** 'วันเสาร์ที่ 22 ส.ค. 2569' */
export function dateLabelLong(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return `วัน${TH_DAYS[day]}ที่ ${d} ${TH_MONTHS_SHORT[m - 1]} ${y + 543}`;
}

/** 'วันนี้' / 'เมื่อวาน' / วันที่ปกติ */
export function relativeDateLabel(isoDate: string): string {
  const today = todayIso();
  if (isoDate === today) return 'วันนี้';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isoDate === toIsoDate(yesterday)) return 'เมื่อวาน';
  return dateLabelLong(isoDate);
}

/** '1,234.50' */
export function formatMoney(value: number, fractionDigits = 2): string {
  return value.toLocaleString('th-TH', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/** ย่อจำนวนเงินสำหรับแกนกราฟ เช่น 12.5K, 1.2M */
export function compactMoney(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
  return `${Math.round(value)}`;
}

/** คำนวณตัวเลขจากนิพจน์ง่ายๆ ที่พิมพ์ในช่องจำนวนเงิน เช่น "120+35*2" */
export function evalAmount(expr: string): number | null {
  const cleaned = expr.replace(/[,\s฿]/g, '');
  if (!cleaned) return null;
  if (!/^[0-9+\-*/.()]+$/.test(cleaned)) return null;
  try {
    // นิพจน์ถูกกรองให้เหลือเฉพาะตัวเลขและเครื่องหมายคำนวณแล้ว
    const value = Function(`"use strict";return (${cleaned})`)() as unknown;
    if (typeof value !== 'number' || !isFinite(value)) return null;
    return Math.round(value * 100) / 100;
  } catch {
    return null;
  }
}
