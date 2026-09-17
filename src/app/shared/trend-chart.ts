import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MonthlyPoint } from '../models/finance.models';
import { compactMoney, formatMoney, monthLabelShort, monthTick } from '../core/utils';

interface Bar {
  month: string;
  label: string;
  income: number;
  expense: number;
  incomeH: number;
  expenseH: number;
  tip: string;
  tick: string;
  /** จอแคบใส่ชื่อเดือนครบ 12 ช่องไม่พอ จึงแสดงเดือนเว้นเดือน โดยให้เดือนล่าสุดแสดงเสมอ */
  showTick: boolean;
  current: boolean;
}

/** กราฟแท่งเทียบรายรับ-รายจ่ายย้อนหลัง 12 เดือน */
@Component({
  selector: 'app-trend-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="top">
      <span>{{ maxLabel() }}</span>
      <span>{{ rangeLabel() }}</span>
    </div>
    <div class="bars">
      @for (bar of bars(); track bar.month) {
        <button
          type="button"
          class="col"
          [class.current]="bar.current"
          [title]="bar.tip"
          [attr.aria-label]="bar.tip"
          (click)="pick.emit(bar.month)"
        >
          <span class="stack">
            <span class="bar income" [class.zero]="!bar.income" [style.height.%]="bar.incomeH"></span>
            <span class="bar expense" [class.zero]="!bar.expense" [style.height.%]="bar.expenseH"></span>
          </span>
          <span class="tick" [class.skip]="!bar.showTick">{{ bar.tick }}</span>
        </button>
      }
    </div>
  `,
  styles: `
    :host { display: block; }

    /* แถวบน: ยอดสูงสุดของกราฟทางซ้าย ช่วงเวลาทางขวา */
    .top {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--sp-2);
      font-size: var(--fs-xs);
      color: var(--text-faint);
    }

    .bars {
      display: flex;
      gap: 2px;
    }

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
    }

    .stack {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 2px;
      height: 124px;
      width: 100%;
      border-radius: 8px;
    }

    .col.current .stack { background: var(--brand-soft); }
    .col.current .tick { color: var(--brand-text); font-weight: 700; }

    .bar {
      display: block;
      width: 8px;
      max-width: 38%;
      border-radius: 4px 4px 2px 2px;
      transition: height 0.25s ease;
    }

    /* เดือนที่ไม่มีข้อมูลไม่ต้องวาดแท่ง แต่ยังกินที่ไว้ให้แท่งอื่นเรียงตรง */
    .bar.zero { visibility: hidden; }
    .bar:not(.zero) { min-height: 3px; }
    .income { background: var(--income); }
    .expense { background: var(--expense); }

    /* ป้ายเดือนบรรทัดเดียว สูงเท่ากันทุกช่อง ฐานของแท่งจึงอยู่ระดับเดียวกันเสมอ */
    .tick {
      height: 18px;
      line-height: 18px;
      font-size: var(--fs-xs);
      color: var(--text-faint);
      white-space: nowrap;
    }

    .tick.skip { visibility: hidden; }
  `,
})
export class TrendChart {
  readonly points = input.required<MonthlyPoint[]>();
  readonly activeMonth = input<string | null>(null);
  readonly pick = output<string>();

  protected readonly max = computed(() =>
    Math.max(1, ...this.points().flatMap((p) => [p.income, p.expense])),
  );

  /** ช่วงเวลาของกราฟ เช่น "ต.ค. 68 – ก.ย. 69" แทนการใส่ปีใต้แท่ง */
  protected readonly rangeLabel = computed(() => {
    const points = this.points();
    if (!points.length) return '';
    return `${monthLabelShort(points[0].month)} – ${monthLabelShort(points[points.length - 1].month)}`;
  });

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
      showTick: (this.points().length - 1 - index) % 2 === 0,
      current: p.month === this.activeMonth(),
    })),
  );
}
