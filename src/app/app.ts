import { Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { BackHandler } from './core/back-handler';
import { AppSwitcher } from './shared/app-switcher';
import { Icon } from './shared/icon';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, AppSwitcher],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly swUpdate = inject(SwUpdate);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly backHandler = inject(BackHandler);

  /**
   * แสดงปุ่มลอยเฉพาะหน้าที่ "เพิ่มรายการ" เป็นสิ่งที่ผู้ใช้น่าจะทำต่อ
   * หน้าฟอร์ม/แท็ก/ตั้งค่าไม่แสดง เพราะปุ่มไปทับปุ่มอื่นที่มุมขวาล่าง
   */
  private static readonly FAB_ROUTES = ['/dashboard', '/transactions', '/workout'];
  protected readonly showFab = signal(true);
  /** ปุ่มลอยหลบชั่วคราวระหว่างเลื่อนหน้าลง เพราะมันบังปุ่มที่อยู่ใต้มัน (เช่น "รายรับ", "คัดลอกข้อความ") */
  protected readonly fabAway = signal(false);
  private lastScrollY = 0;
  /** ส่วนการเงินกับส่วนออกกำลังกายมีสีหลักและเมนูล่างแยกกัน */
  protected readonly mode = signal<'finance' | 'workout'>('finance');
  /** หน้าแรกของแต่ละส่วนแสดงปุ่มสลับส่วนแทนชื่อหน้า */
  protected readonly showSwitcher = signal(false);
  protected readonly heading = signal('');
  protected readonly showBack = signal(false);
  /** หน้าฟอร์มมีแถบบันทึกของตัวเองที่ขอบล่าง จึงซ่อนเมนูหลัก */
  protected readonly showNav = signal(true);
  protected readonly updateReady = signal(false);
  protected readonly installEvent = signal<InstallPromptEvent | null>(null);

  private static readonly FINANCE_NAV = [
    { path: '/dashboard', label: 'ภาพรวม', icon: 'dashboard' },
    { path: '/transactions', label: 'รายการ', icon: 'list' },
    { path: '/report', label: 'รายปี', icon: 'calendar' },
    { path: '/categories', label: 'แท็ก', icon: 'tag' },
    { path: '/settings', label: 'ตั้งค่า', icon: 'settings' },
  ];

  private static readonly WORKOUT_NAV = [
    { path: '/workout', label: 'บันทึก', icon: 'dumbbell' },
    { path: '/workout/history', label: 'ประวัติ', icon: 'history' },
  ];

  protected readonly navItems = computed(() =>
    this.mode() === 'workout' ? App.WORKOUT_NAV : App.FINANCE_NAV,
  );

  constructor() {
    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) return;
      const path = event.urlAfterRedirects.split('?')[0];
      this.showFab.set(App.FAB_ROUTES.includes(path));
      this.fabAway.set(false);
      this.lastScrollY = window.scrollY;
      this.mode.set(path.startsWith('/workout') ? 'workout' : 'finance');

      let child = this.route.firstChild;
      while (child?.firstChild) child = child.firstChild;
      const data = child?.snapshot.data ?? {};
      this.heading.set((data['heading'] as string) ?? '');
      this.showBack.set(!!data['back']);
      this.showNav.set(!data['back']);
      this.showSwitcher.set(!!data['switcher']);
    });

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') this.updateReady.set(true);
      });
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installEvent.set(event as InstallPromptEvent);
    });

    window.addEventListener('appinstalled', () => this.installEvent.set(null));

    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
  }

  protected goBack(): void {
    if (this.backHandler.handle()) return;
    if (history.length > 1) this.location.back();
    else this.router.navigate([this.mode() === 'workout' ? '/workout' : '/dashboard']);
  }

  /** เลื่อนลง = หลบ, เลื่อนขึ้นหรือถึงท้ายหน้า = กลับมา (ท้ายหน้ามีที่เว้นไว้ให้ปุ่มลอยแล้ว ไม่บังอะไร) */
  private onScroll(): void {
    const y = window.scrollY;
    const delta = y - this.lastScrollY;
    if (Math.abs(delta) < 8) return;
    this.lastScrollY = y;
    const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 8;
    this.fabAway.set(delta > 0 && y > 40 && !atBottom);
  }

  protected reloadApp(): void {
    location.reload();
  }

  protected async install(): Promise<void> {
    const event = this.installEvent();
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    this.installEvent.set(null);
  }
}
