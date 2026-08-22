import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly swUpdate = inject(SwUpdate);

  protected readonly updateReady = signal(false);
  protected readonly installEvent = signal<InstallPromptEvent | null>(null);

  protected readonly navItems = [
    { path: '/dashboard', label: 'แดชบอร์ด', icon: '📊' },
    { path: '/transactions', label: 'รายการ', icon: '🧾' },
    { path: '/categories', label: 'แท็ก', icon: '🏷️' },
    { path: '/settings', label: 'ตั้งค่า', icon: '⚙️' },
  ];

  constructor() {
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
