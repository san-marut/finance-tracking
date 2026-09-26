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
import { Icon } from './icon';

const PAGE_SIZE = 12;

/** ตัวเลือกปี — เลื่อนทีละปี หรือแตะตรงกลางเพื่อเลือกจากตารางปี แสดงเป็น พ.ศ. (สไตล์อยู่ใน styles.scss) */
@Component({
  selector: 'app-year-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="picker-bar">
      <button type="button" class="icon-btn soft" (click)="shift(-1)" aria-label="ปีก่อนหน้า">
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
          ปี {{ year() + 543 }} <app-icon name="chevronDown" [size]="16" />
        </span>
        <span class="picker-caption">แตะเพื่อเลือกปี</span>
      </button>

      <button type="button" class="icon-btn soft" (click)="shift(1)" aria-label="ปีถัดไป">
        <app-icon name="chevronRight" />
      </button>

      @if (open()) {
        <div class="picker-panel" role="dialog" aria-label="เลือกปี">
          <div class="picker-panel-head">
            <button type="button" class="icon-btn soft" (click)="page(-1)" aria-label="ย้อนกลับ 12 ปี">
              <app-icon name="chevronLeft" [size]="18" />
            </button>
            <b>{{ pageStart() + 543 }} – {{ pageStart() + 543 + 11 }}</b>
            <button type="button" class="icon-btn soft" (click)="page(1)" aria-label="ถัดไป 12 ปี">
              <app-icon name="chevronRight" [size]="18" />
            </button>
          </div>

          <div class="picker-grid">
            @for (y of years(); track y) {
              <button
                type="button"
                [class.on]="y === year()"
                [attr.aria-pressed]="y === year()"
                [class.now]="y === thisYear"
                (click)="pick(y)"
              >
                {{ y + 543 }}
              </button>
            }
          </div>

          <button type="button" class="picker-now" (click)="jumpToNow()">กลับปีปัจจุบัน</button>
        </div>
      }
    </div>
  `,
  styles: `:host { display: block; }`,
})
export class YearPicker {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly year = input.required<number>();
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
