import { Routes } from '@angular/router';

/**
 * heading = ชื่อบนแถบหัว, back = แสดงปุ่มย้อนกลับแทนโลโก้
 * switcher = แสดงปุ่มสลับส่วนการเงิน/ออกกำลังกายแทนชื่อหน้า
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'แดชบอร์ด · บันทึกประจำวัน',
    data: { heading: 'ภาพรวม', switcher: true },
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'transactions',
    title: 'รายการทั้งหมด · บันทึกประจำวัน',
    data: { heading: 'รายการ' },
    loadComponent: () => import('./pages/transactions/transactions').then((m) => m.Transactions),
  },
  {
    path: 'report',
    title: 'รายงานรายปี · บันทึกประจำวัน',
    data: { heading: 'รายงานรายปี' },
    loadComponent: () => import('./pages/report/report').then((m) => m.Report),
  },
  {
    path: 'entry',
    title: 'เพิ่มรายการ · บันทึกประจำวัน',
    data: { heading: 'เพิ่มรายการ', back: true },
    loadComponent: () => import('./pages/entry/entry').then((m) => m.Entry),
  },
  {
    path: 'entry/:id',
    title: 'แก้ไขรายการ · บันทึกประจำวัน',
    data: { heading: 'แก้ไขรายการ', back: true },
    loadComponent: () => import('./pages/entry/entry').then((m) => m.Entry),
  },
  {
    path: 'categories',
    title: 'จัดการแท็ก · บันทึกประจำวัน',
    data: { heading: 'จัดการแท็ก' },
    loadComponent: () => import('./pages/categories/categories').then((m) => m.Categories),
  },
  {
    path: 'settings',
    title: 'ตั้งค่า · บันทึกประจำวัน',
    data: { heading: 'ตั้งค่า' },
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
  },
  {
    path: 'workout',
    title: 'ออกกำลังกาย · บันทึกประจำวัน',
    data: { heading: 'ออกกำลังกาย', switcher: true },
    loadComponent: () => import('./pages/workout/workout').then((m) => m.Workout),
  },
  {
    path: 'workout/history',
    title: 'ประวัติ · บันทึกประจำวัน',
    data: { heading: 'ประวัติออกกำลังกาย' },
    loadComponent: () =>
      import('./pages/workout-history/workout-history').then((m) => m.WorkoutHistory),
  },
  {
    // หน้าตั้งค่าเดียวกัน แต่อยู่ใต้ /workout ให้เมนูล่างและสีของส่วนออกกำลังกายไม่หายไป
    // (ธีมและการสำรองข้อมูลออกกำลังกายอยู่ในหน้านี้ คนที่ใช้แต่ส่วนนี้ต้องหาเจอ)
    path: 'workout/settings',
    title: 'ตั้งค่า · บันทึกประจำวัน',
    data: { heading: 'ตั้งค่า' },
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
  },
  {
    path: 'workout/add',
    title: 'เพิ่มท่า · บันทึกประจำวัน',
    data: { heading: 'เพิ่มท่า', back: true },
    loadComponent: () => import('./pages/workout-add/workout-add').then((m) => m.WorkoutAdd),
  },
  {
    path: 'workout/edit/:id',
    title: 'แก้ไขท่า · บันทึกประจำวัน',
    data: { heading: 'แก้ไขท่า', back: true },
    loadComponent: () => import('./pages/workout-add/workout-add').then((m) => m.WorkoutAdd),
  },
  { path: '**', redirectTo: 'dashboard' },
];
