import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';

/** แคปซูลสลับระหว่างส่วนการเงินกับส่วนออกกำลังกาย วางบนแถบหัวของหน้าแรกแต่ละส่วน */
@Component({
  selector: 'app-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <nav class="switcher" aria-label="สลับส่วนของแอป">
      <a
        routerLink="/dashboard"
        class="finance"
        [class.on]="mode() === 'finance'"
        [attr.aria-current]="mode() === 'finance' ? 'page' : null"
      >
        <app-icon name="wallet" [size]="18" />
        <span>การเงิน</span>
      </a>
      <a
        routerLink="/workout"
        class="workout"
        [class.on]="mode() === 'workout'"
        [attr.aria-current]="mode() === 'workout' ? 'page' : null"
      >
        <app-icon name="dumbbell" [size]="18" />
        <span>ออกกำลังกาย</span>
      </a>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      flex: 1;
      min-width: 0;
    }

    .switcher {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4px;
      height: 48px;
      padding: 4px;
      border-radius: var(--radius);
      background: var(--seg-track);
    }

    a {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 0;
      border-radius: calc(var(--radius) - 4px);
      font-size: var(--fs-md);
      font-weight: 500;
      color: var(--text-dim);
      white-space: nowrap;
      transition:
        background 0.15s ease,
        color 0.15s ease;
    }

    a.on {
      background: var(--seg-on);
      font-weight: 700;
      box-shadow: 0 4px 12px -6px rgba(90, 50, 20, 0.45);
    }

    /* สีประจำส่วน: การเงิน = คอรัล, ออกกำลังกาย = เขียว */
    a.finance.on {
      color: var(--finance-text);
    }
    a.workout.on {
      color: var(--workout-text);
    }
  `,
})
export class AppSwitcher {
  readonly mode = input.required<'finance' | 'workout'>();
}
