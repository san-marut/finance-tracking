import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkoutStore, entryDetail } from '../../core/workout-store';
import { partById } from '../../core/workout-catalog';
import { WorkoutEntry } from '../../models/workout.models';
import { DayPicker } from '../../shared/day-picker';
import { ExerciseArt } from '../../shared/exercise-art';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-workout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DayPicker, ExerciseArt, Icon],
  templateUrl: './workout.html',
  styleUrl: './workout.scss',
})
export class Workout {
  protected readonly store = inject(WorkoutStore);

  protected readonly rows = computed(() =>
    this.store.dayEntries().map((e) => ({
      entry: e,
      part: partById(e.type, e.partId)?.label ?? '',
      detail: entryDetail(e),
    })),
  );

  /** แตะถังขยะครั้งแรกเพื่อถามยืนยัน แตะอีกครั้งจึงลบ */
  protected readonly confirmingId = signal<string | null>(null);
  protected readonly copied = signal(false);
  private copiedTimer = 0;

  protected askRemove(entry: WorkoutEntry): void {
    if (this.confirmingId() === entry.id) {
      this.store.remove(entry.id);
      this.confirmingId.set(null);
      this.copied.set(false);
    } else {
      this.confirmingId.set(entry.id);
    }
  }

  protected async copy(): Promise<void> {
    const text = this.store.dayText();
    if (!text) return;
    const ok = await copyText(text);
    if (!ok) return;
    this.copied.set(true);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = window.setTimeout(() => this.copied.set(false), 2000);
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // เบราว์เซอร์เก่า/ไม่อนุญาต clipboard API — ใช้วิธีเลือกข้อความแทน
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}
