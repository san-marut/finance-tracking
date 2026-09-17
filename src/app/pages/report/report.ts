import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FinanceStore } from '../../core/finance-store';
import { MonthlyPoint, TxKind } from '../../models/finance.models';
import { dateLabel, monthLabel } from '../../core/utils';
import { CategoryBreakdown } from '../../shared/category-breakdown';
import { Icon } from '../../shared/icon';
import { YearPicker } from '../../shared/year-picker';
import { TrendChart } from '../../shared/trend-chart';
import { MoneyPipe } from '../../shared/money.pipe';

@Component({
  selector: 'app-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CategoryBreakdown, Icon, TrendChart, YearPicker, MoneyPipe],
  templateUrl: './report.html',
  styleUrl: './report.scss',
})
export class Report {
  private readonly router = inject(Router);
  protected readonly store = inject(FinanceStore);

  protected readonly year = signal(new Date().getFullYear());
  protected readonly kindView = signal<TxKind>('expense');

  /** ปี พ.ศ. ไว้แสดงผล */
  protected readonly yearLabel = computed(() => this.year() + 543);

  protected readonly summary = computed(() => this.store.summaryFor(String(this.year())));
  protected readonly prevSummary = computed(() => this.store.summaryFor(String(this.year() - 1)));

  protected readonly points = computed(() => this.store.monthlyPointsOfYear(String(this.year())));

  protected readonly stats = computed(() =>
    this.store.statsFor(this.kindView(), String(this.year())),
  );

  /** เดือนที่มีความเคลื่อนไหวจริง ใช้เป็นตัวหารของค่าเฉลี่ย */
  protected readonly activeMonths = computed(
    () => this.points().filter((p) => p.income > 0 || p.expense > 0).length,
  );

  protected readonly avgIncome = computed(() =>
    this.activeMonths() ? this.summary().income / this.activeMonths() : 0,
  );

  protected readonly avgExpense = computed(() =>
    this.activeMonths() ? this.summary().expense / this.activeMonths() : 0,
  );

  /** เดือนที่จ่ายมากสุด / น้อยสุด (นับเฉพาะเดือนที่มีรายจ่าย) */
  protected readonly spentMonths = computed(() => this.points().filter((p) => p.expense > 0));

  protected readonly topMonth = computed<MonthlyPoint | null>(() => {
    const rows = this.spentMonths();
    return rows.length ? rows.reduce((max, p) => (p.expense > max.expense ? p : max)) : null;
  });

  protected readonly lowMonth = computed<MonthlyPoint | null>(() => {
    const rows = this.spentMonths();
    return rows.length ? rows.reduce((min, p) => (p.expense < min.expense ? p : min)) : null;
  });

  protected readonly largestExpense = computed(() =>
    this.store.largestExpense(String(this.year())),
  );

  protected readonly largestExpenseLabel = computed(() => {
    const tx = this.largestExpense();
    if (!tx) return '';
    const cat = this.store.categoryById(tx.categoryId);
    const sub = this.store.subCategoryById(tx.categoryId, tx.subCategoryId);
    return [cat?.name ?? 'แท็กที่ถูกลบ', sub?.name].filter(Boolean).join(' › ');
  });

  /** อัตราการออม = คงเหลือ / รายรับ */
  protected readonly savingRate = computed(() => {
    const { income, balance } = this.summary();
    return income > 0 ? (balance / income) * 100 : null;
  });

  protected readonly incomeDelta = computed(() => this.delta(this.summary().income, this.prevSummary().income));
  protected readonly expenseDelta = computed(() => this.delta(this.summary().expense, this.prevSummary().expense));

  protected readonly hasPrevYear = computed(() => this.prevSummary().count > 0);

  protected readonly hasData = computed(() => this.summary().count > 0);

  /** กดที่เดือนใดก็ได้เพื่อไปดูรายละเอียดเดือนนั้นในแดชบอร์ด */
  protected openMonth(month: string): void {
    this.store.selectedMonth.set(month);
    this.router.navigate(['/dashboard']);
  }

  protected monthName(month: string): string {
    return monthLabel(month).split(' ')[0];
  }

  protected txDate(date: string): string {
    return dateLabel(date);
  }

  /** ค่าสัมบูรณ์ ไว้แสดงคู่กับลูกศรขึ้น-ลง */
  protected abs(value: number): number {
    return Math.abs(value);
  }

  private delta(now: number, prev: number): number | null {
    if (!prev) return null;
    return ((now - prev) / prev) * 100;
  }
}
