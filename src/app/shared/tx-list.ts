import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FinanceStore } from '../core/finance-store';
import { Transaction } from '../models/finance.models';
import { relativeDateLabel } from '../core/utils';
import { MoneyPipe } from './money.pipe';

interface Row {
  tx: Transaction;
  icon: string;
  color: string;
  /** ชื่อแท็กที่เจาะจงที่สุด (แท็กย่อยถ้ามี) — อ่านบรรทัดเดียวรู้เลยว่าจ่ายค่าอะไร */
  title: string;
  /** บรรทัดรอง: แท็กหลัก · บันทึกช่วยจำ */
  detail: string;
}

interface DayGroup {
  date: string;
  label: string;
  income: number;
  expense: number;
  rows: Row[];
}

/** รายการรับ-จ่ายจัดกลุ่มตามวัน */
@Component({
  selector: 'app-tx-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MoneyPipe],
  template: `
    @for (group of groups(); track group.date) {
      <div class="day">
        @if (showDayHeader()) {
          <div class="day-head">
            <span class="day-label">{{ group.label }}</span>
            <span class="day-sum tabular">
              @if (group.income > 0) {
                <span class="amount-pos">+{{ group.income | money: 0 }}</span>
              }
              @if (group.expense > 0) {
                <span class="amount-neg">−{{ group.expense | money: 0 }}</span>
              }
            </span>
          </div>
        }

        <div class="card list-card">
          @for (row of group.rows; track row.tx.id) {
            <a class="list-row" [routerLink]="['/entry', row.tx.id]">
              <span class="tile" [style.background]="row.color + '1f'">{{ row.icon }}</span>
              <span class="list-text">
                <b class="ellipsis">{{ row.title }}</b>
                <small class="ellipsis">{{ row.detail }}</small>
              </span>
              <span
                class="amount tabular"
                [class.amount-pos]="row.tx.kind === 'income'"
              >
                {{ row.tx.kind === 'income' ? '+' : '−' }}{{ row.tx.amount | money }}
              </span>
            </a>
          }
        </div>
      </div>
    } @empty {
      <div class="card empty">
        <div class="empty-icon">🪶</div>
        <div>{{ emptyText() }}</div>
      </div>
    }
  `,
  styles: `
    :host { display: block; }

    .day + .day { margin-top: var(--sp-5); }

    .day-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--sp-3);
      padding: 0 var(--sp-1) var(--sp-2);
      font-size: var(--fs-sm);
    }

    .day-label { font-weight: 700; color: var(--text-dim); }
    .day-sum { display: flex; gap: var(--sp-3); font-weight: 600; }

    .amount {
      flex: none;
      font-size: var(--fs-base);
      font-weight: 700;
      white-space: nowrap;
    }
  `,
})
export class TxList {
  private readonly store = inject(FinanceStore);

  readonly transactions = input.required<Transaction[]>();
  readonly emptyText = input('ยังไม่มีรายการในช่วงนี้ กดปุ่ม ＋ เพื่อเพิ่มรายการแรก');

  /** ปิดหัวข้อวันได้เมื่อผู้เรียกบอกวันอยู่แล้ว เช่นหน้ารายการโหมดรายวัน */
  readonly showDayHeader = input(true);

  protected readonly groups = computed<DayGroup[]>(() => {
    const map = new Map<string, DayGroup>();

    for (const tx of this.transactions()) {
      const cat = this.store.categoryById(tx.categoryId);
      const sub = this.store.subCategoryById(tx.categoryId, tx.subCategoryId);
      const categoryName = cat?.name ?? 'แท็กที่ถูกลบ';

      let group = map.get(tx.date);
      if (!group) {
        group = { date: tx.date, label: relativeDateLabel(tx.date), income: 0, expense: 0, rows: [] };
        map.set(tx.date, group);
      }

      if (tx.kind === 'income') group.income += tx.amount;
      else group.expense += tx.amount;

      group.rows.push({
        tx,
        icon: cat?.icon ?? '🏷️',
        color: cat?.color ?? '#64748b',
        title: sub?.name ?? categoryName,
        detail: [sub ? categoryName : '', tx.note].filter(Boolean).join(' · ') || 'ไม่มีบันทึก',
      });
    }

    return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
  });
}
