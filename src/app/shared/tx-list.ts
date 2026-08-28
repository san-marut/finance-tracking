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
  categoryName: string;
  subName: string;
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
                <span class="amount-neg">-{{ group.expense | money: 0 }}</span>
              }
            </span>
          </div>
        }

        <div class="card rows">
          @for (row of group.rows; track row.tx.id) {
            <a class="row" [routerLink]="['/entry', row.tx.id]">
              <span class="icon" [style.background]="row.color + '22'" [style.color]="row.color">
                {{ row.icon }}
              </span>
              <span class="info">
                <span class="title">
                  {{ row.categoryName }}
                  @if (row.subName) {
                    <span class="chev">›</span><span class="sub">{{ row.subName }}</span>
                  }
                </span>
                @if (row.tx.note) {
                  <span class="note">{{ row.tx.note }}</span>
                }
              </span>
              <span
                class="amount tabular"
                [class.amount-pos]="row.tx.kind === 'income'"
                [class.amount-neg]="row.tx.kind === 'expense'"
              >
                {{ row.tx.kind === 'income' ? '+' : '-' }}{{ row.tx.amount | money }}
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
    .day { margin-bottom: 18px; }
    .day-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding: 0 6px 7px;
      font-size: 12.5px;
    }
    .day-label { font-weight: 700; color: var(--text-dim); }
    .day-sum { display: flex; gap: 10px; font-weight: 600; }
    .rows { overflow: hidden; }
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      transition: background 0.14s ease;
    }
    .row:last-child { border-bottom: none; }
    .row:active { background: var(--surface-2); }
    .icon {
      flex: none;
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 13px;
      font-size: 19px;
    }
    .info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .title { font-weight: 600; font-size: 14px; }
    .chev { color: var(--text-faint); margin: 0 4px; }
    .sub { color: var(--text-dim); font-weight: 500; }
    .note {
      font-size: 12px;
      color: var(--text-faint);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .amount { font-weight: 700; font-size: 14.5px; white-space: nowrap; }
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

      let group = map.get(tx.date);
      if (!group) {
        group = {
          date: tx.date,
          label: relativeDateLabel(tx.date),
          income: 0,
          expense: 0,
          rows: [],
        };
        map.set(tx.date, group);
      }

      if (tx.kind === 'income') group.income += tx.amount;
      else group.expense += tx.amount;

      group.rows.push({
        tx,
        icon: cat?.icon ?? '🏷️',
        color: cat?.color ?? '#64748b',
        categoryName: cat?.name ?? 'แท็กที่ถูกลบ',
        subName: sub?.name ?? '',
      });
    }

    return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
  });
}
