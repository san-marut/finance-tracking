import { WorkoutType } from '../models/workout.models';

/** ชื่อประเภทที่ขึ้นหน้าแต่ละบรรทัดของข้อความที่คัดลอก */
export const TYPE_LABEL: Record<WorkoutType, string> = {
  weight: 'Weight Training',
  cardio: 'Cardio',
};

/** อุปกรณ์ของท่า ใช้แบ่งกลุ่มและกรองในหน้าเลือกท่า */
export type Equip = 'machine' | 'barbell' | 'dumbbell' | 'cable' | 'other';

export const EQUIPS: { id: Equip; label: string }[] = [
  { id: 'machine', label: 'เครื่อง' },
  { id: 'barbell', label: 'บาร์เบล' },
  { id: 'dumbbell', label: 'ดัมเบล' },
  { id: 'cable', label: 'เคเบิล' },
  { id: 'other', label: 'อื่นๆ' },
];

export interface Exercise {
  /** ชื่อท่าถูกเก็บลงบันทึกตรงๆ ห้ามเปลี่ยนชื่อท่าที่มีอยู่แล้ว ไม่งั้นประวัติจะไม่ต่อกัน */
  name: string;
  equip: Equip;
}

export interface BodyPart {
  id: string;
  label: string;
  exercises: Exercise[];
}

const of = (equip: Equip, names: string[]): Exercise[] => names.map((name) => ({ name, equip }));

/** Cardio ไม่แยกส่วนของร่างกาย ใช้ id นี้แทน */
export const CARDIO_PART: BodyPart = {
  id: 'cardio',
  label: 'คาร์ดิโอ',
  exercises: of('machine', ['Elliptical Trainer', 'Treadmill', 'Bike Indoor']),
};

export const BODY_PARTS: BodyPart[] = [
  {
    id: 'chest',
    label: 'อก',
    exercises: [
      ...of('machine', ['Chest Press Machine', 'Incline Chest Press Machine', 'Chest Fly Machine']),
      ...of('barbell', [
        'Bench Press',
        'Barbell Chest Press',
        'Barbell Lower Chest Press',
        'Barbell Upper Chest Press',
        'Barbell Incline Chest Press',
      ]),
      ...of('dumbbell', [
        'Dumbbell Bench Press',
        'Dumbbell Incline Bench Press',
        'Dumbbell Decline Bench Press',
        'Dumbbell Chest Fly',
        'Dumbbell Incline Chest Fly',
        'Dumbbell Pullover',
      ]),
      ...of('cable', [
        'Cable Crossover High to Low',
        'Cable Crossover Low to High',
        'Cable Chest Press',
        'Cable Single Arm Chest Fly',
      ]),
    ],
  },
  {
    id: 'back',
    label: 'หลัง',
    exercises: [
      ...of('machine', [
        'Lat Pull Down Wide Grip',
        'Lat Pull Down Neutral Grip',
        'Lat Pull Down Single Arm Machine',
        'Seated Row Single Arm Machine',
        'Low Row',
        'Rear Delt Fly Machine',
        'Low Back Machine',
      ]),
      ...of('barbell', [
        'Standing Barbell Back Pull',
        'Barbell Bent Over Row',
        'Barbell Underhand Row',
        'Barbell Deadlift',
        'T-Bar Row',
        'Barbell Shrug',
      ]),
      ...of('dumbbell', [
        'Dumbbell Single Arm Row',
        'Dumbbell Bent Over Row',
        'Dumbbell Incline Bench Row',
        'Dumbbell Shrug',
      ]),
      ...of('cable', [
        'Standing Cable Rope Lat Pushdown',
        'Standing Cable Straight Bar Lat Pushdown',
        'Seated Cable Row V Bar',
        'Seated Cable Row Wide Grip',
        'Cable Single Arm Row',
      ]),
    ],
  },
  {
    id: 'shoulder',
    label: 'ไหล่',
    exercises: [
      ...of('machine', ['Rear Delt Fly Machine']),
      ...of('barbell', ['Barbell Shoulder Pull', 'Barbell Overhead Press', 'Barbell Front Raise']),
      ...of('dumbbell', [
        'Dumbbell Shoulder Press',
        'Dumbbell Shoulder Flys',
        'Dumbbell Arnold Press',
        'Dumbbell Front Raise',
        'Dumbbell Rear Delt Fly',
        'Dumbbell Upright Row',
      ]),
      ...of('cable', [
        'Cable Lateral Raise',
        'Cable Front Raise',
        'Cable Face Pull',
        'Cable Rear Delt Fly',
        'Cable Upright Row',
      ]),
      ...of('other', ['Plate Front Raise']),
    ],
  },
  {
    id: 'biceps',
    label: 'หน้าแขน',
    exercises: [
      ...of('barbell', [
        'Barbell Bicep Curl',
        'Barbell Reverse Bicep Curl',
        'EZ Bar Bicep Curl',
        'EZ Bar Preacher Curl',
        'Barbell Drag Curl',
      ]),
      ...of('dumbbell', [
        'Dumbbell Bicep Curl',
        'Dumbbell Hammer Curl',
        'Dumbbell Incline Curl',
        'Dumbbell Concentration Curl',
        'Dumbbell Preacher Curl',
      ]),
      ...of('cable', [
        'Cable Bicep Curl Straight Bar',
        'Cable Rope Hammer Curl',
        'Cable Single Arm Bicep Curl',
        'Cable Overhead Bicep Curl',
      ]),
    ],
  },
  {
    id: 'triceps',
    label: 'หลังแขน',
    exercises: [
      ...of('machine', ['Tricep Press Machine']),
      ...of('barbell', [
        'Barbell Close Grip Bench Press',
        'EZ Bar Skull Crusher',
        'Barbell Overhead Tricep Extension',
      ]),
      ...of('dumbbell', [
        'Dumbbell Overhead Tricep Extension',
        'Dumbbell Tricep Kickback',
        'Dumbbell Skull Crusher',
      ]),
      ...of('cable', [
        'Tricep Cable V Bar',
        'Tricep Cable Straight Bar',
        'Tricep Cable Rope Pushdown',
        'Tricep Cable Extension Pulldown',
        'Tricep Cable Overhead Rope Extension',
        'Tricep Single Arm Cable Pushdown',
        'Tricep Cable Single Arm Kickback',
      ]),
    ],
  },
  {
    id: 'core',
    label: 'แกนกลางลำตัว',
    exercises: [
      ...of('machine', ['Abdominal Machine']),
      ...of('barbell', ['Barbell Rollout', 'Barbell Landmine Twist']),
      ...of('dumbbell', [
        'Dumbbell Side Bend',
        'Dumbbell Russian Twist',
        'Dumbbell Weighted Crunch',
      ]),
      ...of('cable', [
        'Standing Cable Crunch',
        'Cable Kneeling Crunch',
        'Standing Cable Hight-Low Twist',
        'Cable Pallof Press',
      ]),
      ...of('other', ['Plate Side Bend']),
    ],
  },
  {
    id: 'legs',
    label: 'ขาและก้น',
    exercises: [
      ...of('machine', [
        'Leg Press Machine',
        'Hack Squat Machine',
        'Leg Extension',
        'Leg Curl',
        'Glute Trainer Machine',
        'Glute Kickback Machine',
        'Hip Adductor Machine',
        'Hip Abductor Machine',
      ]),
      ...of('barbell', [
        'Barbell Back Squat',
        'Barbell Front Squat',
        'Barbell Romanian Deadlift',
        'Barbell Hip Thrust',
        'Barbell Lunge',
        'Barbell Standing Calf Raise',
      ]),
      ...of('dumbbell', [
        'Dumbbell Goblet Squat',
        'Dumbbell Lunge',
        'Dumbbell Bulgarian Split Squat',
        'Dumbbell Romanian Deadlift',
        'Dumbbell Step Up',
        'Dumbbell Calf Raise',
      ]),
      ...of('cable', ['Cable Glute Kickback', 'Cable Pull Through', 'Cable Hip Abduction']),
    ],
  },
];

/** อุปกรณ์ของแต่ละชื่อท่า — ไว้เลือกภาพสำรองให้ท่าที่ไม่มีภาพเฉพาะ */
export const EQUIP_OF: ReadonlyMap<string, Equip> = new Map(
  [CARDIO_PART, ...BODY_PARTS].flatMap((p) => p.exercises.map((x) => [x.name, x.equip] as const)),
);

/** นับชื่อท่าไม่ซ้ำ เพราะบางท่าอยู่ได้หลายส่วน เช่น Rear Delt Fly Machine (หลัง + ไหล่) */
export const WEIGHT_EXERCISE_COUNT = new Set(
  BODY_PARTS.flatMap((p) => p.exercises.map((x) => x.name)),
).size;

export function partById(type: WorkoutType, id: string | null): BodyPart | undefined {
  if (type === 'cardio') return CARDIO_PART;
  return BODY_PARTS.find((p) => p.id === id);
}

/** น้ำหนักแบบไม่มีศูนย์ท้าย เช่น 20, 22.5 */
export function formatWeight(kg: number): string {
  return String(Math.round(kg * 100) / 100);
}
