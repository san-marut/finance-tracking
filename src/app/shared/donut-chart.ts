import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MoneyPipe } from './money.pipe';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface Arc extends DonutSegment {
  dash: number;
  gap: number;
  offset: number;
}

const R = 62;
const CIRC = 2 * Math.PI * R;

/** โดนัทชาร์ตแบบ SVG ล้วน ไม่พึ่งไลบรารีภายนอก */
@Component({
  selector: 'app-donut-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe],
  template: `
    <div class="donut">
      <svg viewBox="0 0 160 160" role="img" [attr.aria-label]="caption()">
        <circle class="track" cx="80" cy="80" [attr.r]="r" fill="none" stroke-width="16" />
        @for (arc of arcs(); track arc.label) {
          <circle
            cx="80"
            cy="80"
            [attr.r]="r"
            fill="none"
            stroke-width="16"
            stroke-linecap="butt"
            [attr.stroke]="arc.color"
            [attr.stroke-dasharray]="arc.dash + ' ' + arc.gap"
            [attr.stroke-dashoffset]="arc.offset"
            transform="rotate(-90 80 80)"
          />
        }
      </svg>
      <div class="center">
        <span class="center-cap">{{ caption() }}</span>
        <strong class="tabular">{{ total() | money: 0 }}</strong>
        <span class="center-unit">บาท</span>
      </div>
    </div>
  `,
  styles: `
    .donut { position: relative; width: 176px; height: 176px; flex: none; }
    svg { width: 100%; height: 100%; display: block; }
    .track { stroke: var(--surface-2); }
    .center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1.2;
      pointer-events: none;
    }
    .center-cap { font-size: var(--fs-xs); color: var(--text-faint); }
    .center strong { font-size: var(--fs-2xl); letter-spacing: -0.02em; }
    .center-unit { font-size: var(--fs-xs); color: var(--text-faint); }
  `,
})
export class DonutChart {
  readonly segments = input.required<DonutSegment[]>();
  readonly caption = input('รวม');

  protected readonly r = R;

  protected readonly total = computed(() =>
    this.segments().reduce((sum, s) => sum + s.value, 0),
  );

  protected readonly arcs = computed<Arc[]>(() => {
    const total = this.total();
    if (total <= 0) return [];
    let acc = 0;
    return this.segments()
      .filter((s) => s.value > 0)
      .map((s) => {
        const full = (s.value / total) * CIRC;
        // เว้นช่องไฟเล็กๆ ระหว่างชิ้น ยกเว้นกรณีมีชิ้นเดียว
        const dash = this.segments().length > 1 ? Math.max(full - 2, 0.5) : full;
        const arc: Arc = { ...s, dash, gap: CIRC - dash, offset: -acc };
        acc += full;
        return arc;
      });
  });
}
