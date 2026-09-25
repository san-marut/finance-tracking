import { Injectable, computed, effect, signal } from '@angular/core';
import {
  WorkoutData,
  WorkoutDaySummary,
  WorkoutEntry,
  WorkoutEntryInput,
} from '../models/workout.models';
import { TYPE_LABEL, formatWeight } from './workout-catalog';
import { todayIso, uid } from './utils';

/** แยกคีย์จากข้อมูลการเงิน ข้อมูลสองส่วนไม่ปนกัน */
const STORAGE_KEY = 'workout-log.v1';
const DATA_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class WorkoutStore {
  private readonly _entries = signal<WorkoutEntry[]>([]);
  readonly entries = this._entries.asReadonly();

  /** วันที่กำลังดู/บันทึกอยู่ (YYYY-MM-DD) */
  readonly selectedDate = signal<string>(todayIso());

  /** ท่าของวันที่เลือก เรียงตามลำดับที่เล่น */
  readonly dayEntries = computed(() =>
    this._entries()
      .filter((e) => e.date === this.selectedDate())
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  );

  readonly daySummary = computed(() => summarizeDay(this.selectedDate(), this.dayEntries()));

  /** ข้อความสำหรับคัดลอก: "[ประเภท] [ท่า] [น้ำหนัก] [เซต] [ครั้ง]" หรือ "[ประเภท] [ท่า] [นาที]" */
  readonly dayText = computed(() => this.dayEntries().map(entryLine).join('\n'));

  /** สรุปทุกวันที่มีบันทึก ใหม่สุดก่อน */
  readonly history = computed<WorkoutDaySummary[]>(() => {
    const byDate = new Map<string, WorkoutEntry[]>();
    for (const e of this._entries()) {
      const list = byDate.get(e.date);
      if (list) list.push(e);
      else byDate.set(e.date, [e]);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, rows]) =>
        summarizeDay(
          date,
          rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
        ),
      );
  });

  /** ครั้งล่าสุดของแต่ละท่า ไว้โชว์ในรายการและเติมค่าให้อัตโนมัติ */
  readonly lastByExercise = computed(() => {
    const map = new Map<string, WorkoutEntry>();
    const sorted = [...this._entries()].sort(
      (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt),
    );
    for (const e of sorted) map.set(e.exercise, e);
    return map;
  });

  constructor() {
    this.load();
    effect(() => {
      const data: WorkoutData = { version: DATA_VERSION, entries: this._entries() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // เต็มหรือถูกปิดกั้น — ข้อมูลยังอยู่ในหน่วยความจำระหว่างใช้งาน
      }
    });
  }

  byId(id: string): WorkoutEntry | undefined {
    return this._entries().find((e) => e.id === id);
  }

  add(input: WorkoutEntryInput): void {
    const entry: WorkoutEntry = { ...input, id: uid('wo'), createdAt: new Date().toISOString() };
    this._entries.update((list) => [...list, entry]);
  }

  update(id: string, input: WorkoutEntryInput): void {
    this._entries.update((list) => list.map((e) => (e.id === id ? { ...e, ...input } : e)));
  }

  remove(id: string): void {
    this._entries.update((list) => list.filter((e) => e.id !== id));
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? (JSON.parse(raw) as WorkoutData) : null;
      this._entries.set(Array.isArray(data?.entries) ? data.entries : []);
    } catch {
      this._entries.set([]);
    }
  }
}

export function entryLine(e: WorkoutEntry): string {
  return e.type === 'cardio'
    ? `${TYPE_LABEL.cardio} ${e.exercise} ${e.minutes ?? 0}`
    : `${TYPE_LABEL.weight} ${e.exercise} ${formatWeight(e.weight ?? 0)} ${e.sets ?? 0} ${e.reps ?? 0}`;
}

/** '50 kg · 4×12 · พัก 60 วิ' หรือ '20 นาที' */
export function entryDetail(e: WorkoutEntry): string {
  if (e.type === 'cardio') return `${e.minutes ?? 0} นาที`;
  const weight = e.weight ? `${formatWeight(e.weight)} kg` : 'น้ำหนักตัว';
  return `${weight} · ${e.sets}×${e.reps} · พัก ${restLabel(e.rest ?? 0)}`;
}

export function restLabel(sec: number): string {
  return sec >= 120 && sec % 60 === 0 ? `${sec / 60} นาที` : `${sec} วิ`;
}

function summarizeDay(date: string, rows: WorkoutEntry[]): WorkoutDaySummary {
  let exercises = 0;
  let sets = 0;
  let minutes = 0;
  for (const e of rows) {
    if (e.type === 'cardio') minutes += e.minutes ?? 0;
    else {
      exercises += 1;
      sets += e.sets ?? 0;
    }
  }
  return { date, exercises, sets, minutes, names: rows.map((e) => e.exercise) };
}
