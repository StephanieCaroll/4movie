import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'compactNumber', 
  standalone: true
})
export class CompactNumberPipe implements PipeTransform {

  transform(value: number): string | number {
    if (value === null || value === undefined || isNaN(value)) return '-';
    
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(1) + 'B';
    }
    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(0) + 'M';
    }
    return value.toLocaleString('en-US');
  }
}