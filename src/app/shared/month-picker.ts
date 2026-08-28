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

/** ตัวเลือกเดือน — เลื่อนทีละเดือน หรือแตะตรงกลางเพื่อเลือกเดือนและปีจากแผง */
@Component({
  selector: 'app-month-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="picker">
      <button type="button" class="arrow" (click)="shift(-1)" aria-label="เดือนก่อนหน้า">‹</button>

      <button
        type="button"
        class="label"
        [attr.aria-expanded]="open()"
        aria-haspopup="dialog"
        (click)="togglePanel()"
      >
        <span class="text">{{ label() }} <span class="caret" [class.up]="open()">▾</span></span>
        <small>แตะเพื่อเลือกเดือนและปี</small>
      </button>

      <button type="button" class="arrow" (click)="shift(1)" aria-label="เดือนถัดไป">›</button>

      @if (open()) {
        <div class="panel" role="dialog" aria-label="เลือกเดือนและปี">
          <div class="panel-head">
            <button type="button" class="arrow sm" (click)="shiftYear(-1)" aria-label="ปีก่อนหน้า">
              ‹
            </button>
            <b>{{ panelYear() + 543 }}</b>
            <button type="button" class="arrow sm" (click)="shiftYear(1)" aria-label="ปีถัดไป">
              ›
            </button>
          </div>

          <div class="grid">
            @for (name of monthNames; track $index; let i = $index) {
              <button
                type="button"
                [class.on]="isSelected(i)"
                [class.now]="isCurrent(i)"
                (click)="pick(i)"
              >
                {{ name }}
              </button>
            }
          </div>

          <button type="button" class="now-btn" (click)="jumpToNow()">กลับเดือนปัจจุบัน</button>
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }

    .picker {
      position: relative;
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
    .arrow.sm { width: 32px; height: 32px; font-size: 19px; }

    .label {
      flex: 1;
      min-width: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.2;
      padding: 2px 4px;
    }
    .text { font-size: 15px; font-weight: 700; white-space: nowrap; }
    .label small { font-size: 10px; font-weight: 500; color: var(--text-faint); }

    .caret {
      display: inline-block;
      font-size: 11px;
      color: var(--text-faint);
      transition: transform 0.18s ease;
    }
    .caret.up { transform: rotate(180deg); }

    .panel {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      z-index: 40;
      padding: 12px;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-lg);
    }

    .panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      b { font-size: 16px; }
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;

      button {
        padding: 10px 4px;
        border: 1px solid transparent;
        border-radius: var(--radius-sm);
        background: var(--surface-2);
        font-size: 13px;
        font-weight: 600;
        color: var(--text-dim);
        cursor: pointer;
      }

      button.now { border-color: color-mix(in srgb, var(--brand) 45%, transparent); }

      button.on {
        background: var(--brand);
        border-color: transparent;
        color: #fff;
      }
    }

    .now-btn {
      width: 100%;
      margin-top: 10px;
      padding: 9px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: transparent;
      font-size: 13px;
      font-weight: 600;
      color: var(--brand);
      cursor: pointer;
    }
  `,
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
