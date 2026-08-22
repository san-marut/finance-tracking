import { Pipe, PipeTransform } from '@angular/core';
import { formatMoney } from '../core/utils';

/** 12345.5 -> '12,345.50' (ใส่ digits=0 เพื่อปัดเป็นจำนวนเต็ม) */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined, digits = 2): string {
    return formatMoney(value ?? 0, digits);
  }
}
