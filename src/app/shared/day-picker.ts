import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { relativeDateLabel, shiftDay, todayIso } from '../core/utils';
import { Icon } from './icon';

/** ตัวเลือกวันแบบเลื่อนซ้าย-ขวา แตะตรงกลางเพื่อเปิดปฏิทินของเครื่อง (สไตล์หลักอยู่ใน styles.scss) */
@Component({
  selector: 'app-day-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="picker-bar">
      <button type="button" class="icon-btn soft" (click)="shift(-1)" aria-label="วันก่อนหน้า">
        <app-icon name="chevronLeft" />
      </button>

      <label class="picker-label">
        <span class="picker-title ellipsis">
          {{ label() }} <app-icon name="chevronDown" [size]="16" />
        </span>
        <span class="picker-caption">แตะเพื่อเลือกวัน</span>
        <input type="date" [value]="date()" [max]="today" (change)="pick($event)" />
      </label>

      <button
        type="button"
        class="icon-btn soft"
        [disabled]="isFuture()"
        (click)="shift(1)"
        aria-label="วันถัดไป"
      >
        <app-icon name="chevronRight" />
      </button>
    </div>
  `,
  styles: `
    :host { display: block; }

    /* ทับไว้ทั้งกล่อง แตะแล้วเด้งปฏิทินของเครื่องขึ้นมาเลย */
    .picker-label input {
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

  protected readonly today = todayIso();

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
