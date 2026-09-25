import { Injectable } from '@angular/core';

/**
 * ให้หน้าที่มีหลายขั้นในหน้าเดียว (เช่น เพิ่มท่าออกกำลังกาย) จัดการปุ่มย้อนกลับบนแถบหัวเอง
 * handler คืนค่า true ถ้าจัดการแล้ว (ถอยกลับหนึ่งขั้น) ไม่งั้นแอปย้อนหน้าตามปกติ
 */
@Injectable({ providedIn: 'root' })
export class BackHandler {
  private handler: (() => boolean) | null = null;

  set(handler: () => boolean): void {
    this.handler = handler;
  }

  clear(handler: () => boolean): void {
    if (this.handler === handler) this.handler = null;
  }

  handle(): boolean {
    return this.handler?.() ?? false;
  }
}
