import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CategoryStat } from '../models/finance.models';
import { DonutChart, DonutSegment } from './donut-chart';
import { Icon } from './icon';
import { MoneyPipe } from './money.pipe';

/**
 * โดนัท + รายการยอดแยกตามแท็กหลัก กดขยายดูแท็กย่อยได้
 * แถบสีของแต่ละแถวทำหน้าที่เป็นคำอธิบายสีของโดนัทไปในตัว จึงไม่มี legend แยก
 */
@Component({
  selector: 'app-category-breakdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DonutChart, Icon, MoneyPipe],
  template: `
    @if (stats().length) {
      <div class="donut-wrap">
        <app-donut-chart [segments]="segments()" [caption]="caption()" />
      </div>

      <ul class="cat-list">
        @for (s of stats(); track s.categoryId) {
          <li class="cat">
            <button
              type="button"
              class="cat-head"
              [attr.aria-expanded]="isOpen(s.categoryId)"
              (click)="toggle(s.categoryId)"
            >
              <span class="tile" [style.background]="s.color + '1f'">{{ s.icon }}</span>
              <span class="cat-main">
                <span class="cat-line">
                  <b class="ellipsis">{{ s.name }}</b>
                  <b class="tabular">{{ s.total | money: 0 }}</b>
                </span>
                <span class="meter"><span [style.width.%]="s.percent" [style.background]="s.color"></span></span>
                <span class="cat-meta">
                  <span>{{ s.count }} รายการ</span>
                  <span class="tabular">{{ s.percent | money: 1 }}%</span>
                </span>
              </span>
              <app-icon class="caret" [class.open]="isOpen(s.categoryId)" name="chevronDown" [size]="18" />
            </button>

            @if (isOpen(s.categoryId)) {
              <ul class="sub-list">
                @for (c of s.children; track c.subCategoryId) {
                  <li>
                    <span class="sub-name ellipsis">{{ c.name }}</span>
                    <span class="meter sub-meter"><span [style.width.%]="c.percent" [style.background]="s.color"></span></span>
                    <span class="sub-num tabular">{{ c.total | money: 0 }}</span>
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

    .donut-wrap {
      display: flex;
      justify-content: center;
      padding: var(--sp-2) 0 var(--sp-4);
    }

    .cat-list { list-style: none; margin: 0; padding: 0; }
    .cat { border-top: 1px solid var(--border); }

    .cat-head {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-3) 0;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
    }

    .cat-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .cat-line {
      display: flex;
      justify-content: space-between;
      gap: var(--sp-3);
      font-size: var(--fs-base);
      b:first-child { font-weight: 600; min-width: 0; }
    }

    .cat-meta {
      display: flex;
      justify-content: space-between;
      font-size: var(--fs-xs);
      color: var(--text-faint);
    }

    .caret { color: var(--text-faint); transition: transform 0.18s ease; }
    .caret.open { transform: rotate(180deg); }

    .sub-list {
      list-style: none;
      margin: 0;
      padding: 0 0 var(--sp-3) 52px;
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);

      li {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
        align-items: center;
        gap: var(--sp-3);
        font-size: var(--fs-sm);
      }
    }

    .sub-name { color: var(--text-dim); }
    .sub-meter { height: 5px; }
    .sub-num { font-weight: 600; }
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
