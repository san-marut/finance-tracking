import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { monthLabel, shiftMonth } from '../core/utils';

/** ตัวเลือกเดือนแบบเลื่อนซ้าย-ขวา */
@Component({
  selector: 'app-month-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="picker">
      <button type="button" class="arrow" (click)="shift(-1)" aria-label="เดือนก่อนหน้า">‹</button>
      <button type="button" class="label" (click)="jumpToNow.emit()">
        {{ label() }}
        <small>แตะเพื่อกลับเดือนปัจจุบัน</small>
      </button>
      <button type="button" class="arrow" (click)="shift(1)" aria-label="เดือนถัดไป">›</button>
    </div>
  `,
  styles: `
    .picker {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 4px;
      box-shadow: var(--shadow);
    }
    .arrow {
      width: 38px;
      height: 38px;
      border: none;
      border-radius: 999px;
      background: var(--surface-2);
      color: var(--text-dim);
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
    }
    .arrow:active { transform: scale(0.94); }
    .label {
      flex: 1;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.2;
      padding: 2px 4px;
    }
    .label small { font-size: 10px; font-weight: 500; color: var(--text-faint); }
  `,
})
export class MonthPicker {
  readonly month = input.required<string>();
  readonly monthChange = output<string>();
  readonly jumpToNow = output<void>();

  protected label(): string {
    return monthLabel(this.month());
  }

  protected shift(delta: number): void {
    this.monthChange.emit(shiftMonth(this.month(), delta));
  }
}
