import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { BackHandler } from '../../core/back-handler';
import { WorkoutStore, entryLine, restLabel } from '../../core/workout-store';
import {
  BODY_PARTS,
  CARDIO_PART,
  WEIGHT_EXERCISE_COUNT,
  formatWeight,
  partById,
} from '../../core/workout-catalog';
import { WorkoutEntry, WorkoutEntryInput, WorkoutType } from '../../models/workout.models';
import { ExerciseArt } from '../../shared/exercise-art';
import { Icon } from '../../shared/icon';

type Step = 'type' | 'part' | 'exercise' | 'detail';

interface Field {
  key: 'weight' | 'sets' | 'reps' | 'minutes';
  label: string;
  hint: string;
  unit: string;
  step: number;
  min: number;
  max: number;
}

const WEIGHT_FIELDS: Field[] = [
  {
    key: 'weight',
    label: 'น้ำหนัก',
    hint: 'ปรับทีละ 2.5 kg',
    unit: 'kg',
    step: 2.5,
    min: 0,
    max: 500,
  },
  { key: 'sets', label: 'จำนวนเซต', hint: '', unit: 'เซต', step: 1, min: 1, max: 20 },
  { key: 'reps', label: 'ครั้งต่อเซต', hint: '', unit: 'ครั้ง', step: 1, min: 1, max: 100 },
];

const CARDIO_FIELDS: Field[] = [
  {
    key: 'minutes',
    label: 'เวลา',
    hint: 'ปรับทีละ 5 นาที',
    unit: 'นาที',
    step: 5,
    min: 1,
    max: 600,
  },
];

const REST_OPTIONS = [30, 60, 90, 120, 180];

const DEFAULTS = { weight: 20, sets: 3, reps: 12, rest: 60, minutes: 20 };

@Component({
  selector: 'app-workout-add',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ExerciseArt, Icon],
  templateUrl: './workout-add.html',
  styleUrl: './workout-add.scss',
})
export class WorkoutAdd {
  private readonly store = inject(WorkoutStore);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /** มาจาก route 'workout/edit/:id' */
  readonly id = input<string>();

  protected readonly parts = BODY_PARTS;
  protected readonly cardio = CARDIO_PART;
  protected readonly weightCount = WEIGHT_EXERCISE_COUNT;
  protected readonly restOptions = REST_OPTIONS.map((sec) => ({ sec, label: restLabel(sec) }));

  protected readonly step = signal<Step>('type');
  protected readonly type = signal<WorkoutType>('weight');
  protected readonly partId = signal<string | null>(null);
  protected readonly exercise = signal('');

  protected readonly values = signal({ ...DEFAULTS });

  /** ชื่อท่าที่เพิ่งบันทึกด้วย "บันทึก + ท่าต่อไป" */
  protected readonly savedName = signal('');
  protected readonly confirmDelete = signal(false);

  protected readonly editing = computed(() =>
    this.id() ? this.store.byId(this.id()!) : undefined,
  );
  protected readonly part = computed(() => partById(this.type(), this.partId()));
  protected readonly fields = computed(() =>
    this.type() === 'cardio' ? CARDIO_FIELDS : WEIGHT_FIELDS,
  );

  protected readonly stepLabel = computed(() => {
    const cardio = this.type() === 'cardio';
    switch (this.step()) {
      case 'type':
        return 'ขั้นที่ 1 · เลือกประเภท';
      case 'part':
        return 'ขั้นที่ 2 · เลือกส่วนของร่างกาย';
      case 'exercise':
        return cardio
          ? 'ขั้นที่ 2 · เลือกเครื่อง'
          : `ขั้นที่ 3 · เลือกท่า (${this.part()?.label ?? ''})`;
      default:
        return cardio ? 'Cardio' : `Weight Training › ${this.part()?.label ?? ''}`;
    }
  });

  protected readonly exercises = computed(() => {
    const last = this.store.lastByExercise();
    return (this.part()?.exercises ?? []).map((name) => {
      const prev = last.get(name);
      return { name, last: prev ? lastLabel(prev) : '' };
    });
  });

  protected readonly previewLine = computed(() =>
    entryLine({ ...this.toInput(), id: '', createdAt: '' }),
  );

  constructor() {
    const backHandler = inject(BackHandler);
    const handler = () => this.stepBack();
    backHandler.set(handler);
    inject(DestroyRef).onDestroy(() => backHandler.clear(handler));

    // โหมดแก้ไข: กระโดดไปขั้นสุดท้ายพร้อมค่าเดิม (ทำครั้งเดียวตอนเปิดหน้า)
    let loaded = false;
    effect(() => {
      const e = this.editing();
      if (!e || loaded) return;
      loaded = true;
      this.type.set(e.type);
      this.partId.set(e.partId);
      this.exercise.set(e.exercise);
      this.values.set({
        weight: e.weight ?? DEFAULTS.weight,
        sets: e.sets ?? DEFAULTS.sets,
        reps: e.reps ?? DEFAULTS.reps,
        rest: e.rest ?? DEFAULTS.rest,
        minutes: e.minutes ?? DEFAULTS.minutes,
      });
      this.step.set('detail');
    });
  }

  protected pickType(type: WorkoutType): void {
    this.type.set(type);
    this.savedName.set('');
    if (type === 'cardio') {
      this.partId.set(CARDIO_PART.id);
      this.step.set('exercise');
    } else {
      this.step.set('part');
    }
  }

  protected pickPart(id: string): void {
    this.partId.set(id);
    this.savedName.set('');
    this.step.set('exercise');
  }

  /** เติมค่าจากครั้งล่าสุดของท่านี้ ถ้าไม่เคยเล่นใช้ค่าเริ่มต้น */
  protected pickExercise(name: string): void {
    const prev = this.store.lastByExercise().get(name);
    this.exercise.set(name);
    this.values.set({
      weight: prev?.weight ?? DEFAULTS.weight,
      sets: prev?.sets ?? DEFAULTS.sets,
      reps: prev?.reps ?? DEFAULTS.reps,
      rest: prev?.rest ?? DEFAULTS.rest,
      minutes: prev?.minutes ?? DEFAULTS.minutes,
    });
    this.savedName.set('');
    this.step.set('detail');
  }

  protected bump(field: Field, dir: 1 | -1): void {
    this.setValue(field, this.values()[field.key] + field.step * dir);
  }

  protected typed(field: Field, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const n = Number(raw);
    if (raw !== '' && isFinite(n)) this.setValue(field, n);
  }

  protected setRest(sec: number): void {
    this.values.update((v) => ({ ...v, rest: sec }));
  }

  protected save(next: boolean): void {
    const e = this.editing();
    if (e) {
      this.store.update(e.id, { ...this.toInput(), date: e.date });
      this.leave();
      return;
    }
    this.store.add(this.toInput());
    if (next) {
      this.savedName.set(this.exercise());
      this.step.set('exercise');
    } else {
      this.leave();
    }
  }

  protected remove(): void {
    const e = this.editing();
    if (!e) return;
    this.store.remove(e.id);
    this.leave();
  }

  protected fmt(field: Field): string {
    const v = this.values()[field.key];
    return field.key === 'weight' ? formatWeight(v) : String(v);
  }

  private setValue(field: Field, value: number): void {
    const rounded = Math.round(value * 100) / 100;
    const clamped = Math.min(field.max, Math.max(field.min, rounded));
    this.values.update((v) => ({ ...v, [field.key]: clamped }));
  }

  private toInput(): WorkoutEntryInput {
    const v = this.values();
    const base = {
      date: this.store.selectedDate(),
      type: this.type(),
      partId: this.partId() ?? '',
      exercise: this.exercise(),
    };
    return this.type() === 'cardio'
      ? { ...base, minutes: v.minutes }
      : { ...base, weight: v.weight, sets: v.sets, reps: v.reps, rest: v.rest };
  }

  /** ปุ่มย้อนกลับบนแถบหัว: ถอยทีละขั้น ขั้นแรก (หรือโหมดแก้ไข) ให้แอปออกจากหน้านี้ */
  private stepBack(): boolean {
    if (this.editing()) return false;
    this.savedName.set('');
    switch (this.step()) {
      case 'detail':
        this.step.set('exercise');
        return true;
      case 'exercise':
        this.step.set(this.type() === 'cardio' ? 'type' : 'part');
        return true;
      case 'part':
        this.step.set('type');
        return true;
      default:
        return false;
    }
  }

  private leave(): void {
    if (history.length > 1) this.location.back();
    else this.router.navigate(['/workout']);
  }
}

/** '50 kg · 4×12' หรือ '20 นาที' */
function lastLabel(e: WorkoutEntry): string {
  if (e.type === 'cardio') return `${e.minutes ?? 0} นาที`;
  const weight = e.weight ? `${formatWeight(e.weight)} kg` : 'น้ำหนักตัว';
  return `${weight} · ${e.sets}×${e.reps}`;
}
