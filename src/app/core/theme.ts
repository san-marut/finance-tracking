import { Injectable, effect, signal } from '@angular/core';

export type ThemePref = 'system' | 'light' | 'dark';

/**
 * คีย์แยกจากข้อมูลการเงินและออกกำลังกาย เป็นค่าตั้งของเครื่องนี้เท่านั้น ไม่อยู่ในไฟล์สำรอง
 * index.html อ่านคีย์เดียวกันก่อนแอปโหลด ถ้าเปลี่ยนชื่อต้องแก้ทั้งสองที่
 */
const STORAGE_KEY = 'app-theme';

/** สีแถบสถานะของเบราว์เซอร์/PWA ต้องตรงกับ --bg ของแต่ละธีมใน styles.scss */
const THEME_COLOR = { light: '#fff7ee', dark: '#17120e' };

/** ธีมที่ผู้ใช้เลือก: ตามเครื่อง (ค่าเริ่มต้น) หรือบังคับสว่าง/มืด */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly pref = signal<ThemePref>(readPref());

  constructor() {
    effect(() => {
      const pref = this.pref();
      const root = document.documentElement;
      if (pref === 'system') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', pref);
      syncThemeColor(pref);
      try {
        if (pref === 'system') localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, pref);
      } catch {
        // เก็บไม่ได้ (โหมดส่วนตัว/ถูกปิดกั้น) — ธีมยังใช้ได้จนปิดแอป
      }
    });
  }
}

function readPref(): ThemePref {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

/**
 * meta theme-color ใน index.html เลือกสีตาม media ของเครื่อง
 * ถ้าบังคับธีมไว้ ให้ทั้งสองแท็กใช้สีของธีมนั้น ไม่งั้นแถบสถานะจะคนละสีกับหน้าแอป
 */
function syncThemeColor(pref: ThemePref): void {
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    const media = meta.getAttribute('media') ?? '';
    const systemColor = media.includes('dark') ? THEME_COLOR.dark : THEME_COLOR.light;
    meta.content = pref === 'system' ? systemColor : THEME_COLOR[pref];
  });
}
