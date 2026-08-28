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

const PAGE_SIZE = 12;

/** ตัวเลือกปี — เลื่อนทีละปี หรือแตะตรงกลางเพื่อเลือกจากตารางปี (แสดงเป็น พ.ศ.) */
@Component({
  selector: 'app-year-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="picker">
      <button type="button" class="arrow" (click)="shift(-1)" aria-label="ปีก่อนหน้า">‹</button>

      <button
        type="button"
        class="label"
        [attr.aria-expanded]="open()"
        aria-haspopup="dialog"
        (click)="togglePanel()"
      >
        <small>{{ caption() }}</small>
        <span class="text">
          {{ year() + 543 }} <span class="caret" [class.up]="open()">▾</span>
        </span>
      </button>

      <button type="button" class="arrow" (click)="shift(1)" aria-label="ปีถัดไป">›</button>

      @if (open()) {
        <div class="panel" role="dialog" aria-label="เลือกปี">
          <div class="panel-head">
            <button type="button" class="arrow sm" (click)="page(-1)" aria-label="ย้อนกลับ 12 ปี">
              ‹
            </button>
            <b>{{ pageStart() + 543 }} – {{ pageStart() + 543 + 11 }}</b>
            <button type="button" class="arrow sm" (click)="page(1)" aria-label="ถัดไป 12 ปี">
              ›
            </button>
          </div>

          <div class="grid">
            @for (y of years(); track y) {
              <button
                type="button"
                [class.on]="y === year()"
                [class.now]="y === thisYear"
                (click)="pick(y)"
              >
                {{ y + 543 }}
              </button>
            }
          </div>

          <button type="button" class="now-btn" (click)="jumpToNow()">กลับปีปัจจุบัน</button>
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
      width: 40px;
      height: 40px;
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
      line-height: 1.15;
      padding: 2px;
    }
    .label small { font-size: 10.5px; font-weight: 500; color: var(--text-faint); }
    .text { font-size: 20px; font-weight: 700; }

    .caret {
      display: inline-block;
      font-size: 12px;
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

      b { font-size: 14.5px; }
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
export class YearPicker {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly year = input.required<number>();
  readonly caption = input('รายงานประจำปี');
  readonly yearChange = output<number>();

  protected readonly thisYear = new Date().getFullYear();
  protected readonly open = signal(false);

  /** ปีแรกของหน้าที่แผงกำลังแสดง ตั้งใหม่ทุกครั้งที่เปิดเพื่อให้ปีที่เลือกอยู่กลางๆ */
  protected readonly pageStart = signal(new Date().getFullYear() - 5);

  protected readonly years = computed(() =>
    Array.from({ length: PAGE_SIZE }, (_, i) => this.pageStart() + i),
  );

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
    if (!this.open()) this.pageStart.set(this.year() - 5);
    this.open.update((value) => !value);
  }

  protected shift(delta: number): void {
    this.yearChange.emit(this.year() + delta);
  }

  protected page(delta: number): void {
    this.pageStart.update((start) => start + delta * PAGE_SIZE);
  }

  protected pick(year: number): void {
    this.yearChange.emit(year);
    this.open.set(false);
  }

  protected jumpToNow(): void {
    this.yearChange.emit(this.thisYear);
    this.open.set(false);
  }
}
