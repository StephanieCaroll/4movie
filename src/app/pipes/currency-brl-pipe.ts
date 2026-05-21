import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyBRL'
})
export class CurrencyBRLPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
