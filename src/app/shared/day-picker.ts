import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { relativeDateLabel, shiftDay, todayIso } from '../core/utils';

/** ตัวเลือกวันแบบเลื่อนซ้าย-ขวา แตะตรงกลางเพื่อเปิดปฏิทินของเครื่อง */
@Component({
  selector: 'app-day-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="picker">
      <button type="button" class="arrow" (click)="shift(-1)" aria-label="วันก่อนหน้า">‹</button>

      <label class="label">
        <span class="text">{{ label() }}</span>
        <small>แตะเพื่อเลือกวัน</small>
        <input type="date" [value]="date()" (change)="pick($event)" />
      </label>

      <button
        type="button"
        class="arrow"
        [disabled]="isFuture()"
        (click)="shift(1)"
        aria-label="วันถัดไป"
      >
        ›
      </button>
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
    .arrow:disabled { opacity: 0.35; cursor: not-allowed; }
    .label {
      position: relative;
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.2;
      padding: 2px 4px;
      cursor: pointer;
    }
    .text {
      font-size: 15px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .label small { font-size: 10px; color: var(--text-faint); }
    /* ทับทับตัวหนังสือไว้ทั้งกล่อง แตะแล้วเด้งปฏิทินของเครื่องขึ้นมาเลย */
    .label input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      border: none;
      padding: 0;
      cursor: pointer;
    }
  `,
})
export class DayPicker {
  readonly date = input.required<string>();
  readonly dateChange = output<string>();

  protected label(): string {
    return relativeDateLabel(this.date());
  }

  /** ไม่ให้เลื่อนเลยวันนี้ เพราะยังไม่มีรายการในอนาคตให้ดู */
  protected isFuture(): boolean {
    return this.date() >= todayIso();
  }

  protected shift(delta: number): void {
    this.dateChange.emit(shiftDay(this.date(), delta));
  }

  protected pick(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) this.dateChange.emit(value);
  }
}
