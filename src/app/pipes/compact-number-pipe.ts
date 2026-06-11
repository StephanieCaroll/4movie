import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
 
  name: 'compactNumber', 
  standalone: true
})
export class CompactNumberPipe implements PipeTransform {

  transform(value: number | null | undefined): string {
    
    if (value === null || value === undefined || isNaN(value)) {
      return '-';
    }

    // Bilhões
    if (value >= 1_000_000_000) {
      
      return (value / 1_000_000_000).toFixed(1).replace('.', ',') + ' bi';
    }
    
    // Milhões 
    if (value >= 1_000_000) {
     
      return (value / 1_000_000).toFixed(1).replace('.', ',') + ' mi';
    }
    
    // Milhares 
    if (value >= 10_000) {
    
      return (value / 1_000).toFixed(1).replace('.', ',') + ' mil';
    }
    
    return value.toLocaleString('pt-BR');
  }
}