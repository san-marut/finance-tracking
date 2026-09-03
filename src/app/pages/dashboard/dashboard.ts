import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FinanceStore } from '../../core/finance-store';
import { TxKind } from '../../models/finance.models';
import { currentMonth, dateLabel, daysBetween, monthLabel, todayIso } from '../../core/utils';
import { CategoryBreakdown } from '../../shared/category-breakdown';
import { MonthPicker } from '../../shared/month-picker';
import { TrendChart } from '../../shared/trend-chart';
import { TxList } from '../../shared/tx-list';
import { MoneyPipe } from '../../shared/money.pipe';

type Scope = 'month' | 'all';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CategoryBreakdown, MonthPicker, TrendChart, TxList, MoneyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly store = inject(FinanceStore);

  protected readonly scope = signal<Scope>('month');
  protected readonly kindView = signal<TxKind>('expense');
  /** null = ดูข้อมูลทั้งหมด */
  protected readonly activeMonth = computed(() =>
    this.scope() === 'month' ? this.store.selectedMonth() : null,
  );

  protected readonly summary = computed(() => this.store.summaryFor(this.activeMonth()));

  protected readonly stats = computed(() =>
    this.store.statsFor(this.kindView(), this.activeMonth()),
  );

  /** เปรียบเทียบรายจ่ายกับเดือนก่อน (เฉพาะโหมดรายเดือน) */
  protected readonly expenseDelta = computed(() => {
    if (this.scope() !== 'month') return null;
    const prev = this.store.prevMonthSummary().expense;
    const now = this.store.monthSummary().expense;
    if (!prev) return null;
    return ((now - prev) / prev) * 100;
  });

  /** รายการของวันนี้ทั้งหมด ไม่ขึ้นกับเดือนหรือช่วงที่กำลังดูอยู่ */
  protected readonly todayList = computed(() => {
    const today = todayIso();
    return this.store.sortedTransactions().filter((t) => t.date === today);
  });

  protected readonly todayLabel = computed(() => dateLabel(todayIso()));

  protected readonly scopeLabel = computed(() =>
    this.scope() === 'month' ? monthLabel(this.store.selectedMonth()) : 'ทั้งหมดตั้งแต่เริ่มใช้งาน',
  );

  protected readonly avgPerDay = computed(() => {
    const rows =
      this.scope() === 'month' ? this.store.monthTransactions() : this.store.transactions();
    const days = new Set(rows.map((t) => t.date)).size;
    const expense = this.summary().expense;
    return days ? expense / days : 0;
  });

  protected readonly mealSummary = computed(() => this.store.mealSummary(this.activeMonth()));

  /**
   * จำนวนวันที่ใช้หารค่าอาหาร — นับตามปฏิทิน ไม่ใช่เฉพาะวันที่มีรายการ
   * เดือนปัจจุบันนับถึงวันนี้ เดือนที่ผ่านมานับทั้งเดือน ส่วนโหมดทั้งหมดนับจากรายการแรกถึงวันนี้
   */
  protected readonly mealDays = computed(() => {
    const month = this.activeMonth();

    if (!month) {
      const first = this.store
        .transactions()
        .map((t) => t.date)
        .sort()
        .at(0);
      return first ? daysBetween(first, todayIso()) + 1 : 0;
    }

    const now = currentMonth();
    if (month > now) return 0;
    if (month === now) return Number(todayIso().slice(8, 10));

    const [y, m] = month.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  });

  protected readonly mealPerDay = computed(() => {
    const days = this.mealDays();
    return days ? this.mealSummary().total / days : 0;
  });

  protected setMonth(month: string): void {
    this.store.selectedMonth.set(month);
    this.scope.set('month');
  }
}
