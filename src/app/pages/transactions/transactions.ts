import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceStore } from '../../core/finance-store';
import { TxKind } from '../../models/finance.models';
import { dateLabel, monthLabel, monthOf, todayIso } from '../../core/utils';
import { DayPicker } from '../../shared/day-picker';
import { MonthPicker } from '../../shared/month-picker';
import { TxList } from '../../shared/tx-list';
import { MoneyPipe } from '../../shared/money.pipe';

type KindFilter = 'all' | TxKind;
type ViewMode = 'month' | 'day';

@Component({
  selector: 'app-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DayPicker, MonthPicker, TxList, MoneyPipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  protected readonly store = inject(FinanceStore);

  protected readonly mode = signal<ViewMode>('month');
  protected readonly kindFilter = signal<KindFilter>('all');
  protected readonly categoryFilter = signal<string>('');
  protected readonly query = signal('');

  /** ช่วงที่กำลังดู — 'YYYY-MM' หรือ 'YYYY-MM-DD' ใช้เทียบด้วยการขึ้นต้นของวันที่ได้ทั้งคู่ */
  protected readonly period = computed(() =>
    this.mode() === 'day' ? this.store.selectedDate() : this.store.selectedMonth(),
  );

  protected readonly periodLabel = computed(() =>
    this.mode() === 'day' ? dateLabel(this.store.selectedDate()) : monthLabel(this.store.selectedMonth()),
  );

  /** แท็กระดับ 1 ที่เลือกได้ ตามประเภทที่กรองอยู่ */
  protected readonly categoryOptions = computed(() => {
    const kind = this.kindFilter();
    return kind === 'all' ? this.store.categories() : this.store.categoriesOf(kind);
  });

  protected readonly filtered = computed(() => {
    const period = this.period();
    const kind = this.kindFilter();
    const catId = this.categoryFilter();
    const q = this.query().trim().toLowerCase();

    return this.store.sortedTransactions().filter((t) => {
      if (!t.date.startsWith(period)) return false;
      if (kind !== 'all' && t.kind !== kind) return false;
      if (catId && t.categoryId !== catId) return false;
      if (q) {
        const cat = this.store.categoryById(t.categoryId);
        const sub = this.store.subCategoryById(t.categoryId, t.subCategoryId);
        const haystack = `${t.note} ${cat?.name ?? ''} ${sub?.name ?? ''} ${t.amount}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  });

  protected readonly total = computed(() => {
    let income = 0;
    let expense = 0;
    for (const t of this.filtered()) {
      if (t.kind === 'income') income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, balance: income - expense, count: this.filtered().length };
  });

  protected readonly hasFilter = computed(
    () => this.kindFilter() !== 'all' || !!this.categoryFilter() || !!this.query(),
  );

  protected readonly emptyText = computed(() =>
    this.hasFilter()
      ? 'ไม่พบรายการที่ตรงกับตัวกรอง'
      : `ยังไม่มีรายการใน${this.mode() === 'day' ? 'วัน' : 'เดือน'}นี้ กดปุ่ม ＋ เพื่อเพิ่ม`,
  );

  /** สลับโหมดโดยให้ช่วงเวลาต่อเนื่องกัน ไม่กระโดดไปคนละเดือน */
  protected setMode(mode: ViewMode): void {
    if (mode === this.mode()) return;
    if (mode === 'day') {
      const month = this.store.selectedMonth();
      const today = todayIso();
      this.store.selectedDate.set(monthOf(today) === month ? today : `${month}-01`);
    } else {
      this.store.selectedMonth.set(monthOf(this.store.selectedDate()));
    }
    this.mode.set(mode);
  }

  protected setMonth(month: string): void {
    this.store.selectedMonth.set(month);
  }

  protected setDate(date: string): void {
    this.store.selectedDate.set(date);
  }

  protected setKind(kind: KindFilter): void {
    this.kindFilter.set(kind);
    this.categoryFilter.set('');
  }

  protected clearFilters(): void {
    this.kindFilter.set('all');
    this.categoryFilter.set('');
    this.query.set('');
  }
}
