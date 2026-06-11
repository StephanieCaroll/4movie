import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyBRL',
  standalone: true
})
export class CurrencyBRLPipe implements PipeTransform {

  transform(value: number | string | null | undefined): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) {
      return null;
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  }

}