import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EQUIP_OF, Equip } from '../core/workout-catalog';

type Shape =
  | { t: 'c'; x: number; y: number; r: number }
  | { t: 'p'; d: string }
  | { t: 'r'; x: number; y: number; w: number; h: number; rx: number };

/** ภาพลายเส้นของแต่ละเครื่อง/ท่า วาดบนตาราง 48x48 ใช้สีตาม currentColor */
const ART: Record<string, Shape[]> = {
  chestPress: [
    { t: 'c', x: 17, y: 12, r: 3.5 },
    {
      t: 'p',
      d: 'M12 12V34M12 34H24M18 34V44M17 16V32M17 32H27V42M17 20H31M31 16V24M38 4V44M31 16L38 10',
    },
  ],
  inclinePress: [
    { t: 'c', x: 12, y: 10, r: 3.5 },
    {
      t: 'p',
      d: 'M9 14L15 34M14 15L18 32M16 21L30 14M30 10V18M38 4V44M30 10L38 6M15 34H26M21 34V44M18 32H28V42',
    },
  ],
  chestFly: [
    { t: 'c', x: 24, y: 10, r: 3.5 },
    {
      t: 'p',
      d: 'M24 14V30M24 18L12 14M24 18L36 14M10 8V20M38 8V20M6 4V44M42 4V44M6 4H42M24 30L18 42M24 30L30 42M16 32H32',
    },
  ],
  bench: [
    { t: 'c', x: 9, y: 24, r: 3 },
    { t: 'p', d: 'M6 30H36M10 30V40M32 30V40M13 26H28M28 26L34 34V42M18 26V14M6 14H32' },
    { t: 'r', x: 3, y: 9, w: 3, h: 10, rx: 1 },
    { t: 'r', x: 32, y: 9, w: 3, h: 10, rx: 1 },
  ],
  benchIncline: [
    { t: 'c', x: 9, y: 15, r: 3 },
    { t: 'p', d: 'M8 22L28 34M12 24V42M26 33V42M12 19L26 28M26 28L34 34V42M17 22L21 10M10 10H34' },
    { t: 'r', x: 7, y: 5, w: 3, h: 10, rx: 1 },
    { t: 'r', x: 34, y: 5, w: 3, h: 10, rx: 1 },
  ],
  pulldown: [
    { t: 'c', x: 24, y: 18, r: 3.5 },
    {
      t: 'p',
      d: 'M6 4H42M24 4V10M12 10H36M24 22L14 10M24 22L34 10M24 22V32M16 34H32M24 34V44M24 32H32V42',
    },
    { t: 'c', x: 32, y: 29, r: 2 },
  ],
  row: [
    { t: 'c', x: 14, y: 16, r: 3.5 },
    {
      t: 'p',
      d: 'M14 20V32M8 34H20M14 34V44M14 32L30 34V40M14 23L28 24M28 20V28M28 24H38M38 6V44',
    },
  ],
  barbell: [
    { t: 'c', x: 20, y: 9, r: 3.5 },
    { t: 'p', d: 'M20 13V28M20 28L16 42M20 28L24 42M20 16L17 26M20 16L23 26M8 26H32' },
    { t: 'r', x: 5, y: 21, w: 3, h: 10, rx: 1 },
    { t: 'r', x: 32, y: 21, w: 3, h: 10, rx: 1 },
  ],
  dumbbellCurl: [
    { t: 'c', x: 20, y: 9, r: 3.5 },
    {
      t: 'p',
      d: 'M20 13V28M20 28L16 42M20 28L24 42M20 16L16 24L23 19M21 19H28M21 17V21M28 17V21M20 16L24 26M22 28H28M22 26V30M28 26V30',
    },
  ],
  dumbbellPress: [
    { t: 'c', x: 20, y: 10, r: 3.5 },
    {
      t: 'p',
      d: 'M20 14V28M20 28L16 42M20 28L24 42M20 17L13 15L13 7M20 17L27 15L27 7M9 7H17M9 5V9M17 5V9M23 7H31M23 5V9M31 5V9',
    },
  ],
  dumbbellFly: [
    { t: 'c', x: 20, y: 9, r: 3.5 },
    {
      t: 'p',
      d: 'M20 13V28M20 28L16 42M20 28L24 42M20 17L8 14M20 17L32 14M5 11V17M8 11V17M5 14H8M32 11V17M35 11V17M32 14H35',
    },
  ],
  plate: [
    { t: 'c', x: 18, y: 9, r: 3.5 },
    { t: 'p', d: 'M18 13V28M18 28L14 42M18 28L22 42M18 17L30 18' },
    { t: 'c', x: 34, y: 18, r: 5 },
    { t: 'c', x: 34, y: 18, r: 1.5 },
  ],
  cable: [
    { t: 'c', x: 18, y: 9, r: 3.5 },
    {
      t: 'p',
      d: 'M18 13V28M18 28L14 42M18 28L22 42M40 4V44M35 4H44M38 10L30 24M28 24H32M18 17L30 24',
    },
    { t: 'c', x: 38, y: 8, r: 2 },
  ],
  absMachine: [
    { t: 'c', x: 24, y: 15, r: 3.5 },
    {
      t: 'p',
      d: 'M12 34H26M19 34V44M10 14V34M14 32Q15 22 21 18M21 20L28 24M28 18L32 26M16 32H28V42',
    },
  ],
  seatedPush: [
    { t: 'c', x: 18, y: 10, r: 3.5 },
    {
      t: 'p',
      d: 'M18 14V30M18 17L13 23L22 26M20 26H28M36 4V44M28 26L36 20M12 32H26M18 32V44M18 30H30V42',
    },
  ],
  legPress: [
    { t: 'c', x: 9, y: 19, r: 3.5 },
    { t: 'p', d: 'M4 44H44M6 24L14 40M11 23L16 36M16 36L25 27M25 27L33 15M30 8L40 18M11 26L20 30' },
  ],
  hackSquat: [
    { t: 'c', x: 15, y: 8, r: 3.5 },
    {
      t: 'p',
      d: 'M11 6L25 40M17 12L23 30M23 30L33 32M33 32L30 42M22 42H40M12 14L21 11M17 15L24 20',
    },
  ],
  legExt: [
    { t: 'c', x: 15, y: 10, r: 3.5 },
    { t: 'p', d: 'M10 10V32M10 32H26M16 32V44M15 14V30M15 30H26M26 30L38 26M15 20L20 30' },
    { t: 'c', x: 38, y: 29, r: 2.5 },
  ],
  legCurl: [
    { t: 'c', x: 15, y: 10, r: 3.5 },
    { t: 'p', d: 'M10 10V32M10 32H26M16 32V44M15 14V30M15 30H26M26 30L29 42M15 20L20 30' },
    { t: 'c', x: 32, y: 40, r: 2.5 },
    { t: 'c', x: 26, y: 27, r: 2.5 },
  ],
  kickback: [
    { t: 'c', x: 11, y: 17, r: 3.5 },
    { t: 'p', d: 'M14 20L28 22M16 21V34M28 22V34M28 22L41 13M6 34H34M10 34V42M30 34V42' },
  ],
  hipMachine: [
    { t: 'c', x: 24, y: 10, r: 3.5 },
    {
      t: 'p',
      d: 'M24 14V28M24 28L14 36V44M24 28L34 36V44M10 32V42M38 32V42M18 28H30M24 18L18 26M24 18L30 26',
    },
  ],
  treadmill: [
    { t: 'c', x: 24, y: 8, r: 3.5 },
    { t: 'p', d: 'M24 12L22 24M22 24L16 34M22 24L30 32M23 15L17 20M23 15L29 18M38 36L40 14H44' },
    { t: 'r', x: 4, y: 36, w: 36, h: 5, rx: 2.5 },
  ],
  elliptical: [
    { t: 'c', x: 20, y: 8, r: 3.5 },
    {
      t: 'p',
      d: 'M4 42H44M34 42L37 12M37 14L30 18M10 38L30 34M20 12V24M20 24L14 36M20 24L27 34M20 15L30 18',
    },
  ],
  running: [
    { t: 'c', x: 26, y: 8, r: 3.5 },
    {
      t: 'p',
      d: 'M25 12L22 24M22 24L14 30L8 28M22 24L30 30L28 40M24 15L17 19L15 25M24 15L31 19L36 16M4 44H44',
    },
  ],
  bike: [
    { t: 'c', x: 28, y: 8, r: 3.5 },
    { t: 'p', d: 'M16 20L26 12M26 14L34 16M34 12V20M12 20H20M16 20L24 30L22 38M16 44L24 30L36 34' },
    { t: 'c', x: 36, y: 34, r: 6 },
  ],
  squat: [
    { t: 'c', x: 23, y: 8, r: 3.5 },
    { t: 'p', d: 'M8 14H36M22 13L18 26M18 26L29 30L24 42H30M21 16L28 14' },
    { t: 'r', x: 5, y: 9, w: 3, h: 10, rx: 1 },
    { t: 'r', x: 36, y: 9, w: 3, h: 10, rx: 1 },
  ],
  lunge: [
    { t: 'c', x: 24, y: 8, r: 3.5 },
    {
      t: 'p',
      d: 'M24 12V26M24 26L33 28V40H38M24 26L15 35L9 40M24 15L20 25M17 25H23M17 22V28M23 22V28',
    },
  ],
  deadlift: [
    { t: 'c', x: 13, y: 14, r: 3.5 },
    { t: 'p', d: 'M17 17L32 21M32 21L30 31L32 42H26M19 18L21 32M8 32H34' },
    { t: 'r', x: 5, y: 27, w: 3, h: 10, rx: 1 },
    { t: 'r', x: 34, y: 27, w: 3, h: 10, rx: 1 },
  ],
  bentRow: [
    { t: 'c', x: 13, y: 14, r: 3.5 },
    {
      t: 'p',
      d: 'M17 17L32 21M32 21L30 31L32 42H26M19 18L27 12L23 25M20 25H26M20 22V28M26 22V28',
    },
  ],
  shrug: [
    { t: 'c', x: 20, y: 9, r: 3.5 },
    {
      t: 'p',
      d: 'M20 13V28M20 28L16 42M20 28L24 42M20 16L17 26M20 16L23 26M8 26H32M9 14L12 10L15 14M25 14L28 10L31 14',
    },
    { t: 'r', x: 5, y: 21, w: 3, h: 10, rx: 1 },
    { t: 'r', x: 32, y: 21, w: 3, h: 10, rx: 1 },
  ],
  overheadPress: [
    { t: 'c', x: 20, y: 12, r: 3.5 },
    { t: 'p', d: 'M20 16V30M20 30L16 43M20 30L24 43M20 19L13 14V6M20 19L27 14V6M7 6H33' },
    { t: 'r', x: 4, y: 1, w: 3, h: 10, rx: 1 },
    { t: 'r', x: 33, y: 1, w: 3, h: 10, rx: 1 },
  ],
  hipThrust: [
    { t: 'c', x: 7, y: 21, r: 3.5 },
    { t: 'p', d: 'M4 28H16M8 28V42M11 25L25 22L34 23L36 42H41' },
    { t: 'c', x: 25, y: 16, r: 4.5 },
    { t: 'c', x: 25, y: 16, r: 1.2 },
  ],
  calfRaise: [
    { t: 'c', x: 20, y: 8, r: 3.5 },
    {
      t: 'p',
      d: 'M20 12V27M20 27L18 38L21 42M20 27L23 38L26 42M10 42H32M20 15L15 25M12 25H18M12 22V28M18 22V28M37 32V18M34 21L37 18L40 21',
    },
  ],
  skullCrusher: [
    { t: 'c', x: 8, y: 26, r: 3 },
    { t: 'p', d: 'M5 31H38M10 31V41M34 31V41M12 27H29M29 27L35 35V42M16 26L19 14L11 10' },
    { t: 'c', x: 9, y: 9, r: 2.5 },
  ],
  overheadExt: [
    { t: 'c', x: 22, y: 12, r: 3.5 },
    { t: 'p', d: 'M22 16V30M22 30L18 43M22 30L26 43M22 18L29 5L17 6M17 2V10M15 2H19M15 10H19' },
  ],
  rollout: [
    { t: 'c', x: 12, y: 25, r: 3.5 },
    { t: 'p', d: 'M4 43H44M34 40L28 31M28 31L16 29M17 30L11 37M34 40H42' },
    { t: 'c', x: 10, y: 38, r: 4.5 },
  ],
  seatedTwist: [
    { t: 'c', x: 16, y: 17, r: 3.5 },
    {
      t: 'p',
      d: 'M4 42H44M24 38L18 22M24 38L34 30L42 35M19 25L28 28M28 25V31M31 25V31M28 28H31M8 30Q6 36 12 39',
    },
  ],
  sideBend: [
    { t: 'c', x: 17, y: 10, r: 3.5 },
    {
      t: 'p',
      d: 'M24 30Q23 22 19 15M24 30L20 43M24 30L28 43M19 17L14 28M14 28V34M12 28H16M12 34H16M21 17L28 22L25 28',
    },
  ],
  triKickback: [
    { t: 'c', x: 13, y: 14, r: 3.5 },
    { t: 'p', d: 'M17 17L32 21M32 21L30 31L32 42H26M19 18L27 24L38 21M38 18V24M41 18V24M38 21H41' },
  ],
};

/** ท่าที่ใช้เครื่องหรือท่าทางเดียวกันใช้ภาพเดียวกัน */
const ART_OF_EXERCISE: Record<string, string> = {
  'Chest Press Machine': 'chestPress',
  'Incline Chest Press Machine': 'inclinePress',
  'Chest Fly Machine': 'chestFly',
  'Bench Press': 'bench',
  'Barbell Chest Press': 'bench',
  'Barbell Lower Chest Press': 'bench',
  'Barbell Upper Chest Press': 'benchIncline',
  'Barbell Incline Chest Press': 'benchIncline',
  'Lat Pull Down Wide Grip': 'pulldown',
  'Lat Pull Down Neutral Grip': 'pulldown',
  'Lat Pull Down Single Arm Machine': 'pulldown',
  'Seated Row Single Arm Machine': 'row',
  'Low Row': 'row',
  'Standing Barbell Back Pull': 'barbell',
  'Standing Cable Rope Lat Pushdown': 'cable',
  'Low Back Machine': 'absMachine',
  'Dumbbell Shoulder Press': 'dumbbellPress',
  'Dumbbell Shoulder Flys': 'dumbbellFly',
  'Barbell Shoulder Pull': 'barbell',
  'Rear Delt Fly Machine': 'chestFly',
  'Plate Front Raise': 'plate',
  'Dumbbell Bicep Curl': 'dumbbellCurl',
  'Dumbbell Hammer Curl': 'dumbbellCurl',
  'Barbell Bicep Curl': 'barbell',
  'Barbell Reverse Bicep Curl': 'barbell',
  'Tricep Cable V Bar': 'cable',
  'Tricep Cable Straight Bar': 'cable',
  'Tricep Cable Extension Pulldown': 'cable',
  'Tricep Press Machine': 'seatedPush',
  'Tricep Single Arm Cable Pushdown': 'cable',
  'Abdominal Machine': 'absMachine',
  'Standing Cable Crunch': 'cable',
  'Standing Cable Hight-Low Twist': 'cable',
  'Plate Side Bend': 'plate',
  'Leg Press Machine': 'legPress',
  'Hack Squat Machine': 'hackSquat',
  'Leg Extension': 'legExt',
  'Leg Curl': 'legCurl',
  'Glute Trainer Machine': 'kickback',
  'Glute Kickback Machine': 'kickback',
  'Hip Adductor Machine': 'hipMachine',
  'Hip Abductor Machine': 'hipMachine',
  'Elliptical Trainer': 'elliptical',
  Treadmill: 'treadmill',
  'Bike Indoor': 'bike',
  Running: 'running',
  'Dumbbell Bench Press': 'bench',
  'Dumbbell Decline Bench Press': 'bench',
  'Dumbbell Pullover': 'bench',
  'Barbell Close Grip Bench Press': 'bench',
  'Dumbbell Incline Bench Press': 'benchIncline',
  'Dumbbell Chest Fly': 'dumbbellFly',
  'Dumbbell Incline Chest Fly': 'dumbbellFly',
  'Dumbbell Front Raise': 'dumbbellFly',
  'Dumbbell Rear Delt Fly': 'dumbbellFly',
  'Cable Crossover High to Low': 'chestFly',
  'Cable Crossover Low to High': 'chestFly',
  'Cable Rear Delt Fly': 'chestFly',
  'Dumbbell Arnold Press': 'dumbbellPress',
  'Seated Cable Row V Bar': 'row',
  'Seated Cable Row Wide Grip': 'row',
  'Cable Single Arm Row': 'row',
  'Barbell Back Squat': 'squat',
  'Barbell Front Squat': 'squat',
  'Dumbbell Goblet Squat': 'squat',
  'Barbell Lunge': 'lunge',
  'Dumbbell Lunge': 'lunge',
  'Dumbbell Bulgarian Split Squat': 'lunge',
  'Dumbbell Step Up': 'lunge',
  'Barbell Deadlift': 'deadlift',
  'Barbell Romanian Deadlift': 'deadlift',
  'Dumbbell Romanian Deadlift': 'deadlift',
  'Barbell Bent Over Row': 'bentRow',
  'Barbell Underhand Row': 'bentRow',
  'T-Bar Row': 'bentRow',
  'Dumbbell Single Arm Row': 'bentRow',
  'Dumbbell Bent Over Row': 'bentRow',
  'Dumbbell Incline Bench Row': 'bentRow',
  'Barbell Shrug': 'shrug',
  'Dumbbell Shrug': 'shrug',
  'Barbell Overhead Press': 'overheadPress',
  'Barbell Hip Thrust': 'hipThrust',
  'Barbell Standing Calf Raise': 'calfRaise',
  'Dumbbell Calf Raise': 'calfRaise',
  'EZ Bar Skull Crusher': 'skullCrusher',
  'Dumbbell Skull Crusher': 'skullCrusher',
  'Barbell Overhead Tricep Extension': 'overheadExt',
  'Dumbbell Overhead Tricep Extension': 'overheadExt',
  'Tricep Cable Overhead Rope Extension': 'overheadExt',
  'Barbell Rollout': 'rollout',
  'Dumbbell Russian Twist': 'seatedTwist',
  'Dumbbell Side Bend': 'sideBend',
  'Dumbbell Tricep Kickback': 'triKickback',
};

/** ท่าที่ยังไม่มีภาพเฉพาะ ใช้ภาพตามอุปกรณ์ */
const ART_OF_EQUIP: Record<Equip, string> = {
  machine: 'chestPress',
  barbell: 'barbell',
  dumbbell: 'dumbbellCurl',
  cable: 'cable',
  other: 'plate',
};

@Component({
  selector: 'app-exercise-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="stroke()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @for (s of shapes(); track $index) {
        @switch (s.t) {
          @case ('c') {
            <svg:circle [attr.cx]="s.x" [attr.cy]="s.y" [attr.r]="s.r" />
          }
          @case ('r') {
            <svg:rect
              [attr.x]="s.x"
              [attr.y]="s.y"
              [attr.width]="s.w"
              [attr.height]="s.h"
              [attr.rx]="s.rx"
            />
          }
          @default {
            <svg:path [attr.d]="s.d" />
          }
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      line-height: 0;
    }
  `,
})
export class ExerciseArt {
  readonly exercise = input.required<string>();
  readonly size = input(40);
  readonly stroke = input(2);

  protected readonly shapes = computed(() => {
    const name = this.exercise();
    const equip = EQUIP_OF.get(name);
    return ART[ART_OF_EXERCISE[name] ?? (equip ? ART_OF_EQUIP[equip] : 'barbell')];
  });
}
