import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

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
  bike: [
    { t: 'c', x: 28, y: 8, r: 3.5 },
    { t: 'p', d: 'M16 20L26 12M26 14L34 16M34 12V20M12 20H20M16 20L24 30L22 38M16 44L24 30L36 34' },
    { t: 'c', x: 36, y: 34, r: 6 },
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

  protected readonly shapes = computed(() => ART[ART_OF_EXERCISE[this.exercise()] ?? 'barbell']);
}
