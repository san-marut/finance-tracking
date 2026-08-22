import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MonthlyPoint } from '../models/finance.models';
import { compactMoney, formatMoney, monthTick } from '../core/utils';

interface Bar {
  month: string;
  label: string;
  income: number;
  expense: number;
  incomeH: number;
  expenseH: number;
  tip: string;
  tick: string;
  year: string;
  current: boolean;
}

/** กราฟแท่งเทียบรายรับ-รายจ่ายย้อนหลัง 12 เดือน */
@Component({
  selector: 'app-trend-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <div class="axis">
        <span>{{ maxLabel() }}</span>
        <span>0</span>
      </div>
      <div class="bars">
        @for (bar of bars(); track bar.month) {
          <button
            type="button"
            class="col"
            [class.current]="bar.current"
            [title]="bar.tip"
            (click)="pick.emit(bar.month)"
          >
            <span class="stack">
              <span class="bar income" [style.height.%]="bar.incomeH"></span>
              <span class="bar expense" [style.height.%]="bar.expenseH"></span>
            </span>
            <span class="tick">
              {{ bar.tick }}
              @if (bar.year) {
                <small>{{ bar.year }}</small>
              }
            </span>
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    .wrap { display: flex; gap: 8px; }
    .axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 150px;
      font-size: 10px;
      color: var(--text-faint);
      padding-bottom: 20px;
    }
    .bars {
      flex: 1;
      display: flex;
      align-items: flex-end;
      gap: 3px;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 2px;
    }
    .bars::-webkit-scrollbar { display: none; }
    .col {
      flex: 1 1 0;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      border: none;
      background: transparent;
      padding: 0;
      cursor: pointer;
      border-radius: 8px;
    }
    .col.current .tick { color: var(--brand); font-weight: 700; }
    .col.current .stack { background: var(--surface-2); }
    .stack {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 2px;
      height: 130px;
      width: 100%;
      border-radius: 7px 7px 0 0;
      padding: 0 3px;
    }
    .bar {
      display: block;
      width: 38%;
      max-width: 11px;
      min-height: 3px;
      border-radius: 4px 4px 2px 2px;
      transition: height 0.25s ease;
    }
    .income { background: var(--income); }
    .expense { background: var(--expense); }
    .tick {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.1;
      font-size: 9.5px;
      color: var(--text-faint);
      white-space: nowrap;
    }
    .tick small { font-size: 8px; opacity: 0.75; }
  `,
})
export class TrendChart {
  readonly points = input.required<MonthlyPoint[]>();
  readonly activeMonth = input<string | null>(null);
  readonly pick = output<string>();

  protected readonly max = computed(() =>
    Math.max(1, ...this.points().flatMap((p) => [p.income, p.expense])),
  );

  protected maxLabel(): string {
    return compactMoney(this.max());
  }

  protected readonly bars = computed<Bar[]>(() =>
    this.points().map((p, index) => ({
      month: p.month,
      label: p.label,
      income: p.income,
      expense: p.expense,
      incomeH: (p.income / this.max()) * 100,
      expenseH: (p.expense / this.max()) * 100,
      tip: `${p.label} · รับ ${formatMoney(p.income, 0)} / จ่าย ${formatMoney(p.expense, 0)}`,
      tick: monthTick(p.month).m,
      // แสดงปีเฉพาะช่องแรกและทุกต้นปี เพื่อไม่ให้แกนแน่นเกินไป
      year: index === 0 || p.month.endsWith('-01') ? monthTick(p.month).y : '',
      current: p.month === this.activeMonth(),
    })),
  );
}
