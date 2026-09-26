import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutStore } from '../../core/workout-store';
import { relativeDateLabel } from '../../core/utils';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-workout-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    @if (days().length) {
      <div class="card list-card">
        @for (d of days(); track d.date) {
          <button type="button" class="list-row" (click)="open(d.date)">
            <span class="list-text">
              <b>{{ d.label }}</b>
              <small class="ellipsis">{{ d.names }}</small>
            </span>
            <span class="nums">
              @if (d.exercises) {
                <span>เวท {{ d.exercises }} ท่า · {{ d.sets }} เซต</span>
              }
              @if (d.minutes) {
                <span class="cardio">คาร์ดิโอ {{ d.minutes }} นาที</span>
              }
            </span>
            <app-icon class="faint" name="chevronRight" [size]="18" />
          </button>
        }
      </div>
    } @else {
      <div class="empty">ยังไม่มีประวัติ — บันทึกท่าแรกได้ที่หน้า “บันทึก”</div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .nums {
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: var(--fs-sm);
      font-weight: 500;
      color: var(--brand-text);
      line-height: 1.4;
    }

    .cardio {
      color: var(--meal);
    }

    .empty {
      padding: 28px var(--sp-5);
      border: 1.5px dashed var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      text-align: center;
      font-size: var(--fs-md);
      color: var(--text-faint);
    }
  `,
})
export class WorkoutHistory {
  private readonly store = inject(WorkoutStore);
  private readonly router = inject(Router);

  protected readonly days = computed(() =>
    this.store.history().map((d) => ({
      ...d,
      label: relativeDateLabel(d.date),
      names: d.names.join(' · '),
    })),
  );

  /** เปิดบันทึกของวันนั้นในหน้า "บันทึก" */
  protected open(date: string): void {
    this.store.selectedDate.set(date);
    this.router.navigate(['/workout']);
  }
}
