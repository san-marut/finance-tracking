import { Routes } from '@angular/router';

/** heading = ชื่อบนแถบหัว, back = แสดงปุ่มย้อนกลับแทนโลโก้ */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'แดชบอร์ด · บันทึกรายรับรายจ่าย',
    data: { heading: 'ภาพรวม' },
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'transactions',
    title: 'รายการทั้งหมด · บันทึกรายรับรายจ่าย',
    data: { heading: 'รายการ' },
    loadComponent: () => import('./pages/transactions/transactions').then((m) => m.Transactions),
  },
  {
    path: 'report',
    title: 'รายงานรายปี · บันทึกรายรับรายจ่าย',
    data: { heading: 'รายงานรายปี' },
    loadComponent: () => import('./pages/report/report').then((m) => m.Report),
  },
  {
    path: 'entry',
    title: 'เพิ่มรายการ · บันทึกรายรับรายจ่าย',
    data: { heading: 'เพิ่มรายการ', back: true },
    loadComponent: () => import('./pages/entry/entry').then((m) => m.Entry),
  },
  {
    path: 'entry/:id',
    title: 'แก้ไขรายการ · บันทึกรายรับรายจ่าย',
    data: { heading: 'แก้ไขรายการ', back: true },
    loadComponent: () => import('./pages/entry/entry').then((m) => m.Entry),
  },
  {
    path: 'categories',
    title: 'จัดการแท็ก · บันทึกรายรับรายจ่าย',
    data: { heading: 'จัดการแท็ก' },
    loadComponent: () => import('./pages/categories/categories').then((m) => m.Categories),
  },
  {
    path: 'settings',
    title: 'ตั้งค่า · บันทึกรายรับรายจ่าย',
    data: { heading: 'ตั้งค่า' },
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
  },
  { path: '**', redirectTo: 'dashboard' },
];
