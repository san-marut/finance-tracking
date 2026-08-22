import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FinanceStore } from '../../core/finance-store';
import { todayIso, toIsoDate, uid } from '../../core/utils';
import { Transaction } from '../../models/finance.models';
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

  /** สร้างข้อมูลตัวอย่าง 3 เดือนย้อนหลัง ไว้ลองเล่นแดชบอร์ด */
  protected seedDemo(): void {
    const notes: Record<string, string[]> = {
      'exp-food': ['ข้าวมันไก่', 'กาแฟเช้า', 'ข้าวเย็นกับเพื่อน', 'สั่งเดลิเวอรี'],
      'exp-travel': ['เติมน้ำมัน', 'ค่ารถไฟฟ้า', 'เรียกรถกลับบ้าน'],
      'exp-goods': ['ของใช้เข้าบ้าน', 'ผงซักฟอก', 'เสื้อยืดตัวใหม่'],
      'exp-home': ['ค่าไฟเดือนนี้', 'ค่าเน็ต', 'ค่าเช่าห้อง'],
      'exp-invest': ['DCA กองทุน', 'ซื้อหุ้นเพิ่ม'],
    };

    const rows: Transaction[] = [];
    const today = new Date();

    for (let m = 2; m >= 0; m--) {
      const base = new Date(today.getFullYear(), today.getMonth() - m, 1);

      // เงินเดือนต้นเดือน
      rows.push(
        this.demoTx('income', 'inc-salary', 'inc-salary-main', 45000, base, 1, 'เงินเดือน'),
      );
      if (m === 0) {
        rows.push(
          this.demoTx('income', 'inc-side', 'inc-side-freelance', 8500, base, 12, 'งานฟรีแลนซ์'),
        );
      }

      const fixed: Array<[string, string, number, number]> = [
        ['exp-home', 'exp-home-rent', 9000, 2],
        ['exp-home', 'exp-home-power', 1450, 8],
        ['exp-home', 'exp-home-net', 599, 8],
        ['exp-invest', 'exp-invest-fund', 5000, 5],
      ];
      for (const [cat, sub, amount, day] of fixed) {
        rows.push(this.demoTx('expense', cat, sub, amount, base, day, notes[cat]?.[0] ?? ''));
      }

      const variable = ['exp-food', 'exp-travel', 'exp-goods'];
      for (let i = 0; i < 22; i++) {
        const catId = variable[Math.floor(Math.random() * variable.length)];
        const cat = this.store.categoryById(catId);
        const sub = cat?.children[Math.floor(Math.random() * (cat.children.length || 1))];
        const noteList = notes[catId] ?? [''];
        const amount = Math.round((40 + Math.random() * 420) / 5) * 5;
        const day = 1 + Math.floor(Math.random() * this.maxDay(base));
        rows.push(
          this.demoTx(
            'expense',
            catId,
            sub?.id ?? null,
            amount,
            base,
            day,
            noteList[Math.floor(Math.random() * noteList.length)],
          ),
        );
      }
    }

    this.store.importJson(
      JSON.stringify({
        version: 1,
        categories: this.store.categories(),
        transactions: [...this.store.transactions(), ...rows],
      }),
    );
    this.flash('เพิ่มข้อมูลตัวอย่าง 3 เดือนแล้ว');
  }

  /** เดือนปัจจุบันสุ่มได้ถึงวันนี้เท่านั้น ไม่สร้างรายการในอนาคต */
  private maxDay(base: Date): number {
    const today = new Date();
    const sameMonth =
      base.getFullYear() === today.getFullYear() && base.getMonth() === today.getMonth();
    return sameMonth ? today.getDate() : new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  }

  private demoTx(
    kind: 'income' | 'expense',
    categoryId: string,
    subCategoryId: string | null,
    amount: number,
    base: Date,
    day: number,
    note: string,
  ): Transaction {
    const d = new Date(base.getFullYear(), base.getMonth(), day);
    return {
      id: uid('demo'),
      kind,
      amount,
      date: toIsoDate(d),
      categoryId,
      subCategoryId,
      note,
      createdAt: new Date().toISOString(),
    };
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
