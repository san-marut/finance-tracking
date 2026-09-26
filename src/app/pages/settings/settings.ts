import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FinanceStore } from '../../core/finance-store';
import { WorkoutStore } from '../../core/workout-store';
import { FinanceData } from '../../models/finance.models';
import { WorkoutData } from '../../models/workout.models';
import { dateLabel, todayIso } from '../../core/utils';
import { Icon } from '../../shared/icon';
import { MoneyPipe } from '../../shared/money.pipe';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, MoneyPipe],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  protected readonly store = inject(FinanceStore);
  private readonly workout = inject(WorkoutStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly toast = signal('');
  protected readonly mealOpen = signal(false);
  protected readonly confirmReset = signal(false);
  protected readonly confirmClear = signal(false);

  /** ไฟล์ที่เลือกแล้วแต่ยังไม่แทนที่ข้อมูล รอผู้ใช้ยืนยัน เพราะแทนที่แล้วย้อนกลับไม่ได้ */
  protected readonly pendingImport = signal<PendingImport | null>(null);
  protected readonly workoutCount = computed(() => this.workout.entries().length);

  protected readonly stats = computed(() => {
    const txs = this.store.transactions();
    const dates = txs.map((t) => t.date).sort();
    return {
      count: txs.length,
      categories: this.store.categories().length,
      subCategories: this.store.categories().reduce((n, c) => n + c.children.length, 0),
      firstDate: dates.length ? dateLabel(dates[0]) : '—',
      lastDate: dates.length ? dateLabel(dates[dates.length - 1]) : '—',
      balance: this.store.allTimeSummary().balance,
    };
  });

  protected readonly expenseCategories = computed(() => this.store.categoriesOf('expense'));

  /** ชื่อแท็กที่เลือกไว้ ไว้โชว์สรุปบนแถวก่อนกดเปิด */
  protected readonly mealTagLabels = computed(() => {
    const ids = this.store.mealTagIds();
    if (!ids.length) return 'ยังไม่ได้เลือกแท็ก — ค่าอาหารในแดชบอร์ดจะเป็น 0';
    const names = ids.map((id) => this.store.tagLabel(id));
    return names.length > 3 ? `${names.slice(0, 3).join(', ')} +${names.length - 3}` : names.join(', ');
  });

  /** แท็กย่อยถูกนับอยู่แล้วถ้าเลือกแท็กแม่ทั้งอัน */
  protected isSubPicked(categoryId: string, subId: string): boolean {
    return this.store.isMealTag(categoryId) || this.store.isMealTag(subId);
  }

  protected toggleMealTag(id: string): void {
    this.store.toggleMealTag(id);
  }

  protected resetMealTags(): void {
    this.store.resetMealTags();
    this.flash('คืนค่าแท็กอาหารเป็นสามมื้อเริ่มต้นแล้ว');
  }

  protected exportJson(): void {
    this.download(
      this.store.exportJson(),
      `finance-backup-${todayIso()}.json`,
      'application/json',
    );
    this.flash('ดาวน์โหลดไฟล์สำรองข้อมูลแล้ว');
  }

  protected exportCsv(): void {
    this.download(this.store.exportCsv(), `finance-${todayIso()}.csv`, 'text/csv;charset=utf-8');
    this.flash('ดาวน์โหลดไฟล์ CSV แล้ว');
  }

  protected exportWorkout(): void {
    this.download(
      this.workout.exportJson(),
      `workout-backup-${todayIso()}.json`,
      'application/json',
    );
    this.flash('ดาวน์โหลดไฟล์สำรองออกกำลังกายแล้ว');
  }

  protected async pickImport(target: ImportTarget, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const text = await file.text();

    if (target === 'finance') {
      const data = this.store.parseImport(text);
      if (!data) return this.flash('ไม่ใช่ไฟล์สำรองการเงิน นำเข้าไม่สำเร็จ');
      this.pendingImport.set({ target, data, fileName: file.name, count: data.transactions.length });
    } else {
      const data = this.workout.parseImport(text);
      if (!data) return this.flash('ไม่ใช่ไฟล์สำรองออกกำลังกาย นำเข้าไม่สำเร็จ');
      this.pendingImport.set({ target, data, fileName: file.name, count: data.entries.length });
    }

    // แถวนำเข้าอยู่ล่างกล่องยืนยัน เลื่อนและย้ายโฟกัสไปให้เห็นว่ายังต้องกดยืนยัน
    afterNextRender(
      () => {
        const box = this.host.nativeElement.querySelector<HTMLElement>('.import-confirm');
        box?.scrollIntoView({ block: 'center' });
        box?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  protected confirmImport(): void {
    const pending = this.pendingImport();
    if (!pending) return;
    if (pending.target === 'finance') this.store.applyImport(pending.data);
    else this.workout.applyImport(pending.data);
    this.pendingImport.set(null);
    this.flash('นำเข้าข้อมูลสำเร็จ');
  }

  protected clearTransactions(): void {
    this.store.clearTransactions();
    this.confirmClear.set(false);
    this.flash('ลบรายการทั้งหมดแล้ว');
  }

  protected resetAll(): void {
    this.store.resetAll();
    this.confirmReset.set(false);
    this.flash('คืนค่าเริ่มต้นเรียบร้อย');
  }

  private download(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private flash(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 2000);
  }
}

type ImportTarget = 'finance' | 'workout';

type PendingImport =
  | { target: 'finance'; data: FinanceData; fileName: string; count: number }
  | { target: 'workout'; data: WorkoutData; fileName: string; count: number };
