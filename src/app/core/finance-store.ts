import { Injectable, computed, effect, signal } from '@angular/core';
import {
  Category,
  CategoryStat,
  FinanceData,
  MonthlyPoint,
  SubCategory,
  Summary,
  Transaction,
  TxKind,
} from '../models/finance.models';
import { DEFAULT_CATEGORIES } from './seed-data';
import { currentMonth, monthLabelShort, monthOf, shiftMonth, uid } from './utils';

const STORAGE_KEY = 'finance-tracker.v1';
const DATA_VERSION = 1;

const EMPTY_SUMMARY: Summary = { income: 0, expense: 0, balance: 0, count: 0 };

@Injectable({ providedIn: 'root' })
export class FinanceStore {
  private readonly _categories = signal<Category[]>([]);
  private readonly _transactions = signal<Transaction[]>([]);

  /** เดือนที่กำลังดูอยู่ในหน้า Dashboard/รายการ (YYYY-MM) */
  readonly selectedMonth = signal<string>(currentMonth());

  readonly categories = this._categories.asReadonly();
  readonly transactions = this._transactions.asReadonly();

  readonly expenseCategories = computed(() =>
    this._categories().filter((c) => c.kind === 'expense'),
  );
  readonly incomeCategories = computed(() =>
    this._categories().filter((c) => c.kind === 'income'),
  );

  /** รายการทั้งหมด เรียงใหม่สุดขึ้นก่อน */
  readonly sortedTransactions = computed(() =>
    [...this._transactions()].sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    ),
  );

  /** รายการของเดือนที่เลือก */
  readonly monthTransactions = computed(() =>
    this.sortedTransactions().filter((t) => monthOf(t.date) === this.selectedMonth()),
  );

  readonly monthSummary = computed(() => summarize(this.monthTransactions()));
  readonly allTimeSummary = computed(() => summarize(this._transactions()));

  /** ยอดรวมของเดือนก่อนหน้า ไว้เทียบ % */
  readonly prevMonthSummary = computed(() => {
    const prev = shiftMonth(this.selectedMonth(), -1);
    return summarize(this._transactions().filter((t) => monthOf(t.date) === prev));
  });

  /** รายเดือนย้อนหลัง 12 เดือน (นับจากเดือนที่เลือก) สำหรับกราฟแนวโน้ม */
  readonly monthlyTrend = computed<MonthlyPoint[]>(() => {
    const end = this.selectedMonth();
    const points: MonthlyPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const month = shiftMonth(end, -i);
      const s = summarize(this._transactions().filter((t) => monthOf(t.date) === month));
      points.push({
        month,
        label: monthLabelShort(month),
        income: s.income,
        expense: s.expense,
        balance: s.balance,
      });
    }
    return points;
  });

  /** ปีทั้งหมดที่มีข้อมูล เรียงใหม่ก่อน */
  readonly yearsWithData = computed(() => {
    const set = new Set(this._transactions().map((t) => t.date.slice(0, 4)));
    set.add(currentMonth().slice(0, 4));
    return [...set].sort((a, b) => b.localeCompare(a));
  });

  /** เดือนทั้งหมดที่มีข้อมูล เรียงใหม่ก่อน */
  readonly monthsWithData = computed(() => {
    const set = new Set(this._transactions().map((t) => monthOf(t.date)));
    set.add(currentMonth());
    return [...set].sort((a, b) => b.localeCompare(a));
  });

  constructor() {
    this.load();
    effect(() => {
      const data: FinanceData = {
        version: DATA_VERSION,
        categories: this._categories(),
        transactions: this._transactions(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // เต็มหรือถูกปิดกั้น — ข้อมูลยังอยู่ในหน่วยความจำระหว่างใช้งาน
      }
    });
  }

  // ---------- อ่านข้อมูลประกอบ ----------

  categoryById(id: string): Category | undefined {
    return this._categories().find((c) => c.id === id);
  }

  subCategoryById(categoryId: string, subId: string | null): SubCategory | undefined {
    if (!subId) return undefined;
    return this.categoryById(categoryId)?.children.find((s) => s.id === subId);
  }

  categoriesOf(kind: TxKind): Category[] {
    return this._categories().filter((c) => c.kind === kind);
  }

  transactionById(id: string): Transaction | undefined {
    return this._transactions().find((t) => t.id === id);
  }

  /**
   * ยอดสรุปของช่วงที่ระบุ
   * @param period 'YYYY-MM' = รายเดือน, 'YYYY' = รายปี, null = ทั้งหมด
   */
  summaryFor(period: string | null): Summary {
    return summarize(this.filterBy(period));
  }

  /**
   * ยอดรวมแยกตามแท็ก 2 ระดับ
   * @param period 'YYYY-MM' = รายเดือน, 'YYYY' = รายปี, null = ทั้งหมด
   */
  statsFor(kind: TxKind, period: string | null): CategoryStat[] {
    const rows = this.filterBy(period).filter((t) => t.kind === kind);
    const total = rows.reduce((sum, t) => sum + t.amount, 0);
    const stats: CategoryStat[] = [];

    for (const cat of this.categoriesOf(kind)) {
      const inCat = rows.filter((t) => t.categoryId === cat.id);
      if (!inCat.length) continue;
      const catTotal = inCat.reduce((sum, t) => sum + t.amount, 0);

      const childMap = new Map<string, Transaction[]>();
      for (const t of inCat) {
        const key = t.subCategoryId ?? '__none__';
        const bucket = childMap.get(key);
        if (bucket) bucket.push(t);
        else childMap.set(key, [t]);
      }

      const children = [...childMap.entries()]
        .map(([subId, list]) => {
          const subTotal = list.reduce((sum, t) => sum + t.amount, 0);
          return {
            subCategoryId: subId,
            name:
              subId === '__none__'
                ? 'ไม่ระบุหมวดย่อย'
                : (cat.children.find((s) => s.id === subId)?.name ?? 'หมวดย่อยที่ถูกลบ'),
            total: subTotal,
            percent: catTotal ? (subTotal / catTotal) * 100 : 0,
            count: list.length,
          };
        })
        .sort((a, b) => b.total - a.total);

      stats.push({
        categoryId: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        total: catTotal,
        percent: total ? (catTotal / total) * 100 : 0,
        count: inCat.length,
        children,
      });
    }

    return stats.sort((a, b) => b.total - a.total);
  }

  /** รายการของช่วงที่ระบุ — ใช้การขึ้นต้นของวันที่ ทำให้รองรับทั้งรายเดือนและรายปี */
  private filterBy(period: string | null): Transaction[] {
    const all = this._transactions();
    return period ? all.filter((t) => t.date.startsWith(period)) : all;
  }

  /** 12 เดือนของปีที่ระบุ สำหรับกราฟและตารางในรายงานรายปี */
  monthlyPointsOfYear(year: string): MonthlyPoint[] {
    return Array.from({ length: 12 }, (_, i) => {
      const month = `${year}-${`${i + 1}`.padStart(2, '0')}`;
      const s = this.summaryFor(month);
      return {
        month,
        label: monthLabelShort(month),
        income: s.income,
        expense: s.expense,
        balance: s.balance,
      };
    });
  }

  /** รายการที่จ่ายมากที่สุดในช่วงที่ระบุ */
  largestExpense(period: string | null): Transaction | null {
    const rows = this.filterBy(period).filter((t) => t.kind === 'expense');
    if (!rows.length) return null;
    return rows.reduce((max, t) => (t.amount > max.amount ? t : max));
  }

  // ---------- แก้ไขรายการ ----------

  addTransaction(input: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const tx: Transaction = { ...input, id: uid('tx'), createdAt: new Date().toISOString() };
    this._transactions.update((list) => [tx, ...list]);
    return tx;
  }

  updateTransaction(id: string, patch: Partial<Omit<Transaction, 'id' | 'createdAt'>>): void {
    this._transactions.update((list) =>
      list.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  }

  deleteTransaction(id: string): void {
    this._transactions.update((list) => list.filter((t) => t.id !== id));
  }

  // ---------- แก้ไขแท็ก ----------

  addCategory(kind: TxKind, name: string, icon: string, color: string): Category {
    const cat: Category = { id: uid('cat'), kind, name, icon, color, children: [] };
    this._categories.update((list) => [...list, cat]);
    return cat;
  }

  updateCategory(id: string, patch: Partial<Pick<Category, 'name' | 'icon' | 'color'>>): void {
    this._categories.update((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  /** ลบแท็กระดับ 1 พร้อมรายการที่ใช้แท็กนั้น */
  deleteCategory(id: string): void {
    this._categories.update((list) => list.filter((c) => c.id !== id));
    this._transactions.update((list) => list.filter((t) => t.categoryId !== id));
  }

  addSubCategory(categoryId: string, name: string): void {
    this._categories.update((list) =>
      list.map((c) =>
        c.id === categoryId ? { ...c, children: [...c.children, { id: uid('sub'), name }] } : c,
      ),
    );
  }

  renameSubCategory(categoryId: string, subId: string, name: string): void {
    this._categories.update((list) =>
      list.map((c) =>
        c.id === categoryId
          ? { ...c, children: c.children.map((s) => (s.id === subId ? { ...s, name } : s)) }
          : c,
      ),
    );
  }

  /** ลบแท็กระดับ 2 รายการที่ผูกอยู่จะเหลือแค่แท็กระดับ 1 */
  deleteSubCategory(categoryId: string, subId: string): void {
    this._categories.update((list) =>
      list.map((c) =>
        c.id === categoryId ? { ...c, children: c.children.filter((s) => s.id !== subId) } : c,
      ),
    );
    this._transactions.update((list) =>
      list.map((t) => (t.subCategoryId === subId ? { ...t, subCategoryId: null } : t)),
    );
  }

  /** จำนวนรายการที่ใช้แท็กนี้ */
  usageOfCategory(categoryId: string): number {
    return this._transactions().filter((t) => t.categoryId === categoryId).length;
  }

  usageOfSubCategory(subId: string): number {
    return this._transactions().filter((t) => t.subCategoryId === subId).length;
  }

  // ---------- นำเข้า/ส่งออก ----------

  exportJson(): string {
    return JSON.stringify(
      {
        version: DATA_VERSION,
        exportedAt: new Date().toISOString(),
        categories: this._categories(),
        transactions: this._transactions(),
      },
      null,
      2,
    );
  }

  exportCsv(): string {
    const head = ['วันที่', 'ประเภท', 'แท็กหลัก', 'แท็กย่อย', 'จำนวนเงิน', 'บันทึก'];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = this.sortedTransactions().map((t) => {
      const cat = this.categoryById(t.categoryId);
      const sub = this.subCategoryById(t.categoryId, t.subCategoryId);
      return [
        t.date,
        t.kind === 'income' ? 'รายรับ' : 'รายจ่าย',
        cat?.name ?? '',
        sub?.name ?? '',
        String(t.amount),
        t.note,
      ]
        .map(esc)
        .join(',');
    });
    return '﻿' + [head.map(esc).join(','), ...rows].join('\n');
  }

  /** คืนค่า true ถ้านำเข้าสำเร็จ */
  importJson(raw: string): boolean {
    try {
      const parsed = JSON.parse(raw) as Partial<FinanceData>;
      if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.transactions)) return false;
      this._categories.set(parsed.categories);
      this._transactions.set(parsed.transactions);
      return true;
    } catch {
      return false;
    }
  }

  /** ลบเฉพาะรายการรับ-จ่าย เก็บแท็กไว้ */
  clearTransactions(): void {
    this._transactions.set([]);
  }

  /** คืนค่าเริ่มต้นทั้งหมด */
  resetAll(): void {
    this._categories.set(structuredClone(DEFAULT_CATEGORIES));
    this._transactions.set([]);
  }

  private load(): void {
    let data: FinanceData | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) data = JSON.parse(raw) as FinanceData;
    } catch {
      data = null;
    }
    this._categories.set(
      data?.categories?.length ? data.categories : structuredClone(DEFAULT_CATEGORIES),
    );
    this._transactions.set(data?.transactions ?? []);
  }
}

function summarize(rows: Transaction[]): Summary {
  if (!rows.length) return EMPTY_SUMMARY;
  let income = 0;
  let expense = 0;
  for (const t of rows) {
    if (t.kind === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense, count: rows.length };
}
