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
    @if (rangeLabel(); as range) {
      <div class="range">{{ range }}</div>
    }
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
              <span class="bar income" [class.zero]="!bar.income" [style.height.%]="bar.incomeH"></span>
              <span class="bar expense" [class.zero]="!bar.expense" [style.height.%]="bar.expenseH"></span>
            </span>
            <span class="tick" [class.skip]="!bar.showTick">{{ bar.tick }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    .range {
      margin: -4px 0 8px;
      text-align: right;
      font-size: var(--fs-xs);
      color: var(--text-faint);
    }
    .wrap { display: flex; gap: 8px; }
    /* ความสูงแกน = ความสูงแท่ง (130) + ป้ายเดือน (18) + ช่องไฟ (6) ให้เลข 0 ตรงฐานของแท่งพอดี */
    .axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 154px;
      padding-bottom: 24px;
      font-size: var(--fs-xs);
      line-height: 1;
      color: var(--text-faint);
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
    .col.current .stack { background-color: var(--brand-soft); }
    .stack {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 2px;
      height: 130px;
      width: 100%;
      border-radius: 8px;
      padding: 0 2px;
      background: repeating-linear-gradient(
        to top,
        transparent 0 32px,
        color-mix(in srgb, var(--border) 60%, transparent) 32px 33px
      );
    }
    .bar {
      display: block;
      width: 38%;
      max-width: 11px;
      min-height: 3px;
      border-radius: 4px 4px 2px 2px;
      transition: height 0.25s ease;
    }
    /* เดือนที่ไม่มีข้อมูลไม่ต้องมีขีดเล็กๆ ให้ดูเหมือนมียอด แต่ยังกินที่ไว้ให้แท่งเรียงตรง */
    .bar.zero { visibility: hidden; }
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
    /* ซ่อนแบบยังกินที่ ให้แท่งกราฟยังเรียงตรงกัน */
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
