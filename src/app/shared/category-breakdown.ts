import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CategoryStat } from '../models/finance.models';
import { DonutChart, DonutSegment } from './donut-chart';
import { MoneyPipe } from './money.pipe';

/** โดนัท + รายการยอดแยกตามแท็กระดับ 1 กดขยายดูระดับ 2 ได้ (ใช้ร่วมกันทั้งแดชบอร์ดและรายงานรายปี) */
@Component({
  selector: 'app-category-breakdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DonutChart, MoneyPipe],
  template: `
    @if (stats().length) {
      <div class="donut-row">
        <app-donut-chart [segments]="segments()" [caption]="caption()" />
        <ul class="legend">
          @for (s of topStats(); track s.categoryId) {
            <li>
              <span class="chip" [style.background]="s.color"></span>
              <span class="lg-name">{{ s.name }}</span>
              <span class="lg-pct tabular faint">{{ s.percent | money: 0 }}%</span>
            </li>
          }
          @if (stats().length > 6) {
            <li class="faint">และอีก {{ stats().length - 6 }} แท็ก</li>
          }
        </ul>
      </div>

      <ul class="cat-list">
        @for (s of stats(); track s.categoryId) {
          <li class="cat">
            <button type="button" class="cat-head" (click)="toggle(s.categoryId)">
              <span class="cat-icon" [style.background]="s.color + '22'" [style.color]="s.color">
                {{ s.icon }}
              </span>
              <span class="cat-main">
                <span class="cat-name">
                  {{ s.name }}
                  <small class="faint">({{ s.count }} รายการ)</small>
                </span>
                <span class="meter">
                  <span
                    class="meter-fill"
                    [style.width.%]="s.percent"
                    [style.background]="s.color"
                  ></span>
                </span>
              </span>
              <span class="cat-num">
                <b class="tabular">{{ s.total | money: 0 }}</b>
                <small class="faint tabular">{{ s.percent | money: 1 }}%</small>
              </span>
              <span class="caret" [class.open]="isOpen(s.categoryId)">›</span>
            </button>

            @if (isOpen(s.categoryId)) {
              <ul class="sub-list">
                @for (c of s.children; track c.subCategoryId) {
                  <li>
                    <span class="sub-name">{{ c.name }}</span>
                    <span class="sub-meter">
                      <span
                        class="meter-fill"
                        [style.width.%]="c.percent"
                        [style.background]="s.color"
                      ></span>
                    </span>
                    <span class="tabular sub-num">{{ c.total | money: 0 }}</span>
                  </li>
                }
              </ul>
            }
          </li>
        }
      </ul>
    } @else {
      <div class="empty">
        <div class="empty-icon">📭</div>
        <div>{{ emptyText() }}</div>
      </div>
    }
  `,
  styles: `
    :host { display: block; }

    .donut-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
    }

    .legend {
      flex: 1;
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }
    .legend li { display: flex; align-items: center; gap: 8px; font-size: 12.5px; }
    .lg-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip { width: 10px; height: 10px; border-radius: 3px; flex: none; display: inline-block; }

    .cat-list { list-style: none; margin: 0; padding: 6px 0 0; }
    .cat + .cat { border-top: 1px solid var(--border); }

    .cat-head {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 11px 2px;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
    }

    .cat-icon {
      flex: none;
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      font-size: 18px;
    }

    .cat-main { flex: 1; min-width: 0; }

    .cat-name {
      display: block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .cat-name small { font-weight: 500; font-size: 11px; }

    .meter,
    .sub-meter {
      display: block;
      height: 6px;
      border-radius: 999px;
      background: var(--surface-2);
      overflow: hidden;
    }

    .meter-fill {
      display: block;
      height: 100%;
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    .cat-num {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      line-height: 1.25;
    }
    .cat-num b { font-size: 14.5px; }
    .cat-num small { font-size: 11px; }

    .caret {
      color: var(--text-faint);
      font-size: 20px;
      transition: transform 0.18s ease;
    }
    .caret.open { transform: rotate(90deg); }

    .sub-list {
      list-style: none;
      margin: 0 0 10px;
      padding: 4px 0 4px 49px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sub-list li { display: flex; align-items: center; gap: 10px; font-size: 12.5px; }

    .sub-name {
      flex: 0 0 38%;
      color: var(--text-dim);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sub-meter { flex: 1; height: 5px; opacity: 0.75; }
    .sub-num { flex: none; font-weight: 600; }

    @media (max-width: 420px) {
      .donut-row { flex-direction: column; align-items: stretch; }
      .donut-row app-donut-chart { align-self: center; }
    }
  `,
})
export class CategoryBreakdown {
  readonly stats = input.required<CategoryStat[]>();
  readonly caption = input('รวม');
  readonly emptyText = input('ยังไม่มีข้อมูลในช่วงนี้');

  private readonly expanded = signal<ReadonlySet<string>>(new Set());

  protected readonly segments = computed<DonutSegment[]>(() =>
    this.stats().map((s) => ({ label: s.name, value: s.total, color: s.color })),
  );

  protected readonly topStats = computed(() => this.stats().slice(0, 6));

  protected toggle(categoryId: string): void {
    const next = new Set(this.expanded());
    if (next.has(categoryId)) next.delete(categoryId);
    else next.add(categoryId);
    this.expanded.set(next);
  }

  protected isOpen(categoryId: string): boolean {
    return this.expanded().has(categoryId);
  }
}
