import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceStore } from '../../core/finance-store';
import { Category, TxKind } from '../../models/finance.models';
import { ICON_CHOICES, PALETTE } from '../../core/seed-data';

@Component({
  selector: 'app-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  private readonly store = inject(FinanceStore);

  protected readonly icons = ICON_CHOICES;
  protected readonly palette = PALETTE;

  protected readonly kind = signal<TxKind>('expense');
  protected readonly list = computed(() => this.store.categoriesOf(this.kind()));

  private readonly opened = signal<ReadonlySet<string>>(new Set());
  protected readonly editingId = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);
  protected readonly showAdd = signal(false);

  // ฟอร์มเพิ่มแท็กระดับ 1
  protected readonly newName = signal('');
  protected readonly newIcon = signal(ICON_CHOICES[0]);
  protected readonly newColor = signal(PALETTE[0]);

  // ฟอร์มแก้ไขแท็กระดับ 1
  protected readonly editName = signal('');
  protected readonly editIcon = signal('');
  protected readonly editColor = signal('');

  // ข้อความในช่องเพิ่มแท็กระดับ 2 แยกตามแท็กแม่
  protected readonly subDrafts = signal<Record<string, string>>({});

  protected isOpen(id: string): boolean {
    return this.opened().has(id);
  }

  protected toggle(id: string): void {
    const next = new Set(this.opened());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.opened.set(next);
  }

  protected usage(id: string): number {
    return this.store.usageOfCategory(id);
  }

  protected subUsage(id: string): number {
    return this.store.usageOfSubCategory(id);
  }

  // ---------- เพิ่มแท็กระดับ 1 ----------

  protected openAdd(): void {
    this.showAdd.set(true);
    this.newName.set('');
    this.newIcon.set(this.icons[0]);
    this.newColor.set(this.palette[Math.floor(Math.random() * this.palette.length)]);
  }

  protected addCategory(): void {
    const name = this.newName().trim();
    if (!name) return;
    const cat = this.store.addCategory(this.kind(), name, this.newIcon(), this.newColor());
    this.showAdd.set(false);
    this.toggle(cat.id);
  }

  // ---------- แก้ไขแท็กระดับ 1 ----------

  protected startEdit(cat: Category): void {
    this.editingId.set(cat.id);
    this.editName.set(cat.name);
    this.editIcon.set(cat.icon);
    this.editColor.set(cat.color);
  }

  protected saveEdit(): void {
    const id = this.editingId();
    const name = this.editName().trim();
    if (!id || !name) return;
    this.store.updateCategory(id, { name, icon: this.editIcon(), color: this.editColor() });
    this.editingId.set(null);
  }

  protected removeCategory(id: string): void {
    this.store.deleteCategory(id);
    this.deletingId.set(null);
  }

  // ---------- แท็กระดับ 2 ----------

  protected draftOf(catId: string): string {
    return this.subDrafts()[catId] ?? '';
  }

  protected setDraft(catId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.subDrafts.update((drafts) => ({ ...drafts, [catId]: value }));
  }

  protected addSub(catId: string): void {
    const name = this.draftOf(catId).trim();
    if (!name) return;
    this.store.addSubCategory(catId, name);
    this.subDrafts.update((drafts) => ({ ...drafts, [catId]: '' }));
  }

  protected renameSub(catId: string, subId: string, event: Event): void {
    const name = (event.target as HTMLInputElement).value.trim();
    if (name) this.store.renameSubCategory(catId, subId, name);
  }

  protected removeSub(catId: string, subId: string): void {
    this.store.deleteSubCategory(catId, subId);
  }
}
