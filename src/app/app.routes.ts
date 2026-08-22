import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'แดชบอร์ด · บันทึกรายรับรายจ่าย',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'transactions',
    title: 'รายการทั้งหมด · บันทึกรายรับรายจ่าย',
    loadComponent: () => import('./pages/transactions/transactions').then((m) => m.Transactions),
  },
  {
    path: 'entry',
    title: 'เพิ่มรายการ · บันทึกรายรับรายจ่าย',
    loadComponent: () => import('./pages/entry/entry').then((m) => m.Entry),
  },
  {
    path: 'entry/:id',
    title: 'แก้ไขรายการ · บันทึกรายรับรายจ่าย',
    loadComponent: () => import('./pages/entry/entry').then((m) => m.Entry),
  },
  {
    path: 'categories',
    title: 'จัดการแท็ก · บันทึกรายรับรายจ่าย',
    loadComponent: () => import('./pages/categories/categories').then((m) => m.Categories),
  },
  {
    path: 'settings',
    title: 'ตั้งค่า · บันทึกรายรับรายจ่าย',
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
  },
  { path: '**', redirectTo: 'dashboard' },
];
