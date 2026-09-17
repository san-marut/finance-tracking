import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FinanceStore } from '../../core/finance-store';
import { TxKind } from '../../models/finance.models';
import { dateLabelLong, evalAmount, shiftDay, todayIso } from '../../core/utils';
import { Icon } from '../../shared/icon';
import { MoneyPipe } from '../../shared/money.pipe';

@Component({
  selector: 'app-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Icon, MoneyPipe],
  templateUrl: './entry.html',
  styleUrl: './entry.scss',
})
export class Entry {
  private readonly store = inject(FinanceStore);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /** id ของรายการที่แก้ไข (มาจาก route param) */
  readonly id = input<string | undefined>(undefined);

  protected readonly kind = signal<TxKind>('expense');
  protected readonly amountText = signal('');
  protected readonly date = signal(todayIso());
  protected readonly note = signal('');
  protected readonly categoryId = signal<string | null>(null);
  protected readonly subCategoryId = signal<string | null>(null);
  protected readonly toast = signal('');
  protected readonly confirmDelete = signal(false);

  protected readonly isEdit = computed(() => !!this.id());

  protected readonly categories = computed(() => this.store.categoriesOf(this.kind()));

  protected readonly subCategories = computed(() => {
    const id = this.categoryId();
    return id ? (this.store.categoryById(id)?.children ?? []) : [];
  });

  protected readonly amount = computed(() => evalAmount(this.amountText()));

  /** แสดงผลลัพธ์เมื่อผู้ใช้พิมพ์เป็นนิพจน์ เช่น 120+35 */
  protected readonly isExpression = computed(() => /[+\-*/]/.test(this.amountText().slice(1)));

  protected readonly dateText = computed(() => dateLabelLong(this.date()));

  /** สรุปบนแถบบันทึกด้านล่าง ให้เห็นวันที่และแท็กก่อนกดบันทึก */
  protected readonly summaryTag = computed(() => {
    const catId = this.categoryId();
    if (!catId) return 'ยังไม่ได้เลือกแท็ก';
    const sub = this.store.subCategoryById(catId, this.subCategoryId());
    return sub?.name ?? this.store.categoryById(catId)?.name ?? '';
  });

  protected readonly canSave = computed(
    () => (this.amount() ?? 0) > 0 && !!this.categoryId() && !!this.date(),
  );

  protected readonly quickAdds = [1, 5, 10, 20, 50, 100, 500, 1000];

  constructor() {
    // โหลดค่ารายการเดิมเมื่อเข้าโหมดแก้ไข
    effect(() => {
      const id = this.id();
      if (!id) return;
      const tx = this.store.transactionById(id);
      if (!tx) return;
      this.kind.set(tx.kind);
      this.amountText.set(String(tx.amount));
      this.date.set(tx.date);
      this.note.set(tx.note);
      this.categoryId.set(tx.categoryId);
      this.subCategoryId.set(tx.subCategoryId);
    });
  }

  protected switchKind(kind: TxKind): void {
    if (this.kind() === kind) return;
    this.kind.set(kind);
    this.categoryId.set(null);
    this.subCategoryId.set(null);
  }

  protected pickCategory(id: string): void {
    if (this.categoryId() === id) return;
    this.categoryId.set(id);
    this.subCategoryId.set(null);
  }

  protected pickSub(id: string): void {
    this.subCategoryId.set(this.subCategoryId() === id ? null : id);
  }

  protected quickAdd(value: number): void {
    const current = this.amount() ?? 0;
    this.amountText.set(String(Math.round((current + value) * 100) / 100));
  }

  protected clearAmount(): void {
    this.amountText.set('');
  }

  protected shiftDate(days: number): void {
    this.date.set(shiftDay(this.date(), days));
  }

  protected save(stay = false): void {
    if (!this.canSave()) return;
    const payload = {
      kind: this.kind(),
      amount: this.amount()!,
      date: this.date(),
      categoryId: this.categoryId()!,
      subCategoryId: this.subCategoryId(),
      note: this.note().trim(),
    };

    const editId = this.id();
    if (editId) {
      this.store.updateTransaction(editId, payload);
      this.location.back();
      return;
    }

    this.store.addTransaction(payload);

    if (stay) {
      this.amountText.set('');
      this.note.set('');
      this.subCategoryId.set(null);
      this.flash('บันทึกแล้ว เพิ่มรายการต่อได้เลย');
      return;
    }

    this.router.navigate(['/dashboard']);
  }

  protected remove(): void {
    const editId = this.id();
    if (!editId) return;
    this.store.deleteTransaction(editId);
    this.router.navigate(['/transactions']);
  }

  private flash(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 1800);
  }
}
