import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceStore } from '../../core/finance-store';
import { TxKind } from '../../models/finance.models';
import { currentMonth, monthOf } from '../../core/utils';
import { MonthPicker } from '../../shared/month-picker';
import { TxList } from '../../shared/tx-list';
import { MoneyPipe } from '../../shared/money.pipe';

type KindFilter = 'all' | TxKind;

@Component({
  selector: 'app-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MonthPicker, TxList, MoneyPipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  protected readonly store = inject(FinanceStore);

  protected readonly allMonths = signal(false);
  protected readonly kindFilter = signal<KindFilter>('all');
  protected readonly categoryFilter = signal<string>('');
  protected readonly query = signal('');

  /** แท็กระดับ 1 ที่เลือกได้ ตามประเภทที่กรองอยู่ */
  protected readonly categoryOptions = computed(() => {
    const kind = this.kindFilter();
    return kind === 'all' ? this.store.categories() : this.store.categoriesOf(kind);
  });

  protected readonly filtered = computed(() => {
    const month = this.allMonths() ? null : this.store.selectedMonth();
    const kind = this.kindFilter();
    const catId = this.categoryFilter();
    const q = this.query().trim().toLowerCase();

    return this.store.sortedTransactions().filter((t) => {
      if (month && monthOf(t.date) !== month) return false;
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

  protected setMonth(month: string): void {
    this.store.selectedMonth.set(month);
    this.allMonths.set(false);
  }

  protected resetMonth(): void {
    this.store.selectedMonth.set(currentMonth());
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
