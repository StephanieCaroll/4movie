import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'genreName',
  standalone: true
})
export class GenreNamePipe implements PipeTransform {
  private genres: { [key: number]: string } = {
    28: 'Ação',
    12: 'Aventura',
    16: 'Animação',
    35: 'Comédia',
    80: 'Crime',
    99: 'Documentário',
    18: 'Drama',
    10751: 'Família',
    14: 'Fantasia',
    36: 'História',
    27: 'Terror',
    10402: 'Música',
    9648: 'Mistério',
    10749: 'Romance',
    878: 'Ficção Científica',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'Guerra',
    37: 'Faroeste'
  };

  transform(genreId: number): string {
    return this.genres[genreId] || 'Geral';
  }
}