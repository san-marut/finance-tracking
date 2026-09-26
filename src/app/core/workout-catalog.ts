import { WorkoutType } from '../models/workout.models';

/** ชื่อประเภทที่ขึ้นหน้าแต่ละบรรทัดของข้อความที่คัดลอก */
export const TYPE_LABEL: Record<WorkoutType, string> = {
  weight: 'Weight Training',
  cardio: 'Cardio',
};

export interface BodyPart {
  id: string;
  label: string;
  exercises: string[];
}

/** Cardio ไม่แยกส่วนของร่างกาย ใช้ id นี้แทน */
export const CARDIO_PART: BodyPart = {
  id: 'cardio',
  label: 'คาร์ดิโอ',
  exercises: ['Elliptical Trainer', 'Treadmill', 'Bike Indoor'],
};

export const BODY_PARTS: BodyPart[] = [
  {
    id: 'chest',
    label: 'อก',
    exercises: [
      'Chest Press Machine',
      'Incline Chest Press Machine',
      'Chest Fly Machine',
      'Bench Press',
      'Barbell Chest Press',
      'Barbell Lower Chest Press',
      'Barbell Upper Chest Press',
      'Barbell Incline Chest Press',
    ],
  },
  {
    id: 'back',
    label: 'หลัง',
    exercises: [
      'Lat Pull Down Wide Grip',
      'Lat Pull Down Neutral Grip',
      'Lat Pull Down Single Arm Machine',
      'Seated Row Single Arm Machine',
      'Low Row',
      'Standing Barbell Back Pull',
      'Standing Cable Rope Lat Pushdown',
      'Low Back Machine',
    ],
  },
  {
    id: 'shoulder',
    label: 'ไหล่',
    exercises: [
      'Dumbbell Shoulder Press',
      'Dumbbell Shoulder Flys',
      'Barbell Shoulder Pull',
      'Rear Delt Fly Machine',
      'Plate Front Raise',
    ],
  },
  {
    id: 'biceps',
    label: 'หน้าแขน',
    exercises: [
      'Dumbbell Bicep Curl',
      'Dumbbell Hammer Curl',
      'Barbell Bicep Curl',
      'Barbell Reverse Bicep Curl',
    ],
  },
  {
    id: 'triceps',
    label: 'หลังแขน',
    exercises: [
      'Tricep Cable V Bar',
      'Tricep Cable Straight Bar',
      'Tricep Cable Extension Pulldown',
      'Tricep Press Machine',
      'Tricep Single Arm Cable Pushdown',
    ],
  },
  {
    id: 'core',
    label: 'แกนกลางลำตัว',
    exercises: [
      'Abdominal Machine',
      'Standing Cable Crunch',
      'Standing Cable Hight-Low Twist',
      'Plate Side Bend',
    ],
  },
  {
    id: 'legs',
    label: 'ขาและก้น',
    exercises: [
      'Leg Press Machine',
      'Hack Squat Machine',
      'Leg Extension',
      'Leg Curl',
      'Glute Trainer Machine',
      'Glute Kickback Machine',
      'Hip Adductor Machine',
      'Hip Abductor Machine',
    ],
  },
];

export const WEIGHT_EXERCISE_COUNT = BODY_PARTS.reduce((n, p) => n + p.exercises.length, 0);

export function partById(type: WorkoutType, id: string | null): BodyPart | undefined {
  if (type === 'cardio') return CARDIO_PART;
  return BODY_PARTS.find((p) => p.id === id);
}

/** น้ำหนักแบบไม่มีศูนย์ท้าย เช่น 20, 22.5 */
export function formatWeight(kg: number): string {
  return String(Math.round(kg * 100) / 100);
}
