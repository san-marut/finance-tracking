export type WorkoutType = 'weight' | 'cardio';

/** หนึ่งท่าที่เล่นในวันนั้น */
export interface WorkoutEntry {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  type: WorkoutType;
  /** id ของส่วนร่างกาย ('cardio' สำหรับ Cardio) */
  partId: string;
  exercise: string;
  /** kg (0 = ใช้น้ำหนักตัว) — เฉพาะ weight */
  weight?: number;
  sets?: number;
  reps?: number;
  /** วินาทีที่พักต่อเซต */
  rest?: number;
  /** นาที — เฉพาะ cardio */
  minutes?: number;
  createdAt: string;
}

export type WorkoutEntryInput = Omit<WorkoutEntry, 'id' | 'createdAt'>;

export interface WorkoutData {
  version: number;
  entries: WorkoutEntry[];
}

export interface WorkoutDaySummary {
  date: string;
  exercises: number;
  sets: number;
  minutes: number;
  names: string[];
}
