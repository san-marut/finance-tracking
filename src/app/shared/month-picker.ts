import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TH_MONTHS_SHORT, currentMonth, monthLabel, shiftMonth } from '../core/utils';
import { Icon } from './icon';

/** ตัวเลือกเดือน — เลื่อนทีละเดือน หรือแตะตรงกลางเพื่อเลือกเดือนและปีจากแผง (สไตล์อยู่ใน styles.scss) */
@Component({
  selector: 'app-month-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="picker-bar">
      <button type="button" class="icon-btn soft" (click)="shift(-1)" aria-label="เดือนก่อนหน้า">
        <app-icon name="chevronLeft" />
      </button>

      <button
        type="button"
        class="picker-label"
        [attr.aria-expanded]="open()"
        aria-haspopup="dialog"
        (click)="togglePanel()"
      >
        <span class="picker-title" [class.open]="open()">
          {{ label() }} <app-icon name="chevronDown" [size]="16" />
        </span>
        <span class="picker-caption">แตะเพื่อเลือกเดือนและปี</span>
      </button>

      <button type="button" class="icon-btn soft" (click)="shift(1)" aria-label="เดือนถัดไป">
        <app-icon name="chevronRight" />
      </button>

      @if (open()) {
        <div class="picker-panel" role="dialog" aria-label="เลือกเดือนและปี">
          <div class="picker-panel-head">
            <button type="button" class="icon-btn soft" (click)="shiftYear(-1)" aria-label="ปีก่อนหน้า">
              <app-icon name="chevronLeft" [size]="18" />
            </button>
            <b>{{ panelYear() + 543 }}</b>
            <button type="button" class="icon-btn soft" (click)="shiftYear(1)" aria-label="ปีถัดไป">
              <app-icon name="chevronRight" [size]="18" />
            </button>
          </div>

          <div class="picker-grid">
            @for (name of monthNames; track $index; let i = $index) {
              <button
                type="button"
                [class.on]="isSelected(i)"
                [attr.aria-pressed]="isSelected(i)"
                [class.now]="isCurrent(i)"
                (click)="pick(i)"
              >
                {{ name }}
              </button>
            }
          </div>

          <button type="button" class="picker-now" (click)="jumpToNow()">กลับเดือนปัจจุบัน</button>
        </div>
      }
    </div>
  `,
  styles: `:host { display: block; }`,
})
export class MonthPicker {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly month = input.required<string>();
  readonly monthChange = output<string>();

  protected readonly monthNames = TH_MONTHS_SHORT;
  protected readonly open = signal(false);

  /** ปีที่แผงกำลังแสดง แยกจากเดือนที่เลือกจริง เพื่อให้เปิดดูปีอื่นได้ก่อนตัดสินใจ */
  protected readonly panelYear = signal(new Date().getFullYear());

  protected readonly label = computed(() => monthLabel(this.month()));

  private readonly selectedYear = computed(() => Number(this.month().slice(0, 4)));
  private readonly selectedMonthIndex = computed(() => Number(this.month().slice(5, 7)) - 1);

  @HostListener('document:pointerdown', ['$event'])
  protected onDocumentClick(event: Event): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.open.set(false);
  }

  protected togglePanel(): void {
    if (!this.open()) this.panelYear.set(this.selectedYear());
    this.open.update((value) => !value);
  }

  protected shift(delta: number): void {
    this.monthChange.emit(shiftMonth(this.month(), delta));
  }

  protected shiftYear(delta: number): void {
    this.panelYear.update((year) => year + delta);
  }

  protected isSelected(index: number): boolean {
    return this.panelYear() === this.selectedYear() && this.selectedMonthIndex() === index;
  }

  /** เดือนปัจจุบันจริงๆ ตามปฏิทิน ไว้ทำกรอบบางๆ ให้หาเจอง่าย */
  protected isCurrent(index: number): boolean {
    const now = currentMonth();
    return this.panelYear() === Number(now.slice(0, 4)) && Number(now.slice(5, 7)) - 1 === index;
  }

  protected pick(index: number): void {
    this.monthChange.emit(`${this.panelYear()}-${`${index + 1}`.padStart(2, '0')}`);
    this.open.set(false);
  }

  protected jumpToNow(): void {
    this.monthChange.emit(currentMonth());
    this.open.set(false);
  }
}
