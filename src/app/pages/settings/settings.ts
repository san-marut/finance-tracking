import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FinanceStore } from '../../core/finance-store';
import { todayIso } from '../../core/utils';
import { MoneyPipe } from '../../shared/money.pipe';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  protected readonly store = inject(FinanceStore);

  protected readonly toast = signal('');
  protected readonly confirmReset = signal(false);
  protected readonly confirmClear = signal(false);

  protected readonly stats = computed(() => {
    const txs = this.store.transactions();
    const dates = txs.map((t) => t.date).sort();
    return {
      count: txs.length,
      categories: this.store.categories().length,
      subCategories: this.store.categories().reduce((n, c) => n + c.children.length, 0),
      firstDate: dates.at(0) ?? '-',
      lastDate: dates.at(-1) ?? '-',
      balance: this.store.allTimeSummary().balance,
    };
  });

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

  protected async importFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    const ok = this.store.importJson(text);
    this.flash(ok ? 'นำเข้าข้อมูลสำเร็จ' : 'ไฟล์ไม่ถูกต้อง นำเข้าไม่สำเร็จ');
    input.value = '';
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
