// Imports
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Dados
export interface Movie {
  id: number;              
  title: string;          
  overview: string;        
  poster_path: string;     
  vote_average: number;    
  release_date: string;    
}

// O Injectable com 'root' significa que o Angular vai criar UMA única instância
// deste service para todo o app (singleton)
@Injectable({
  providedIn: 'root'
})
export class MovieService {
  // URL da API
  private baseUrl = 'https://api.themoviedb.org/3';
  
  // URL base para carregar as imagens dos posters 
  private imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  
  // Chave de acesso à API 
  private apiKey = '35afafd1cc281f164f0aa4def053c2ee';

  // Construtor: injeta o HttpClient para fazer as requisições
  constructor(private http: HttpClient) { }

  // Busca os filmes populares (lista usada na Home Page)
  // Retorna um Observable que contém um objeto com uma lista (array) de filmes
  getPopularMovies(): Observable<{ results: Movie[] }> {
    return this.http.get<{ results: Movie[] }>(
      `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=pt-BR`
    );
  }

  // Busca os detalhes de UM filme específico pelo ID
  // Usado na página de detalhes
  getMovieById(id: number): Observable<Movie> {
    return this.http.get<Movie>(
      `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&language=pt-BR`
    );
  }

  // Monta a URL completa da imagem do poster
  // Se não tiver poster, retorna string vazia
  getPosterUrl(posterPath: string): string {
    return posterPath ? `${this.imageBaseUrl}${posterPath}` : '';
  }
}