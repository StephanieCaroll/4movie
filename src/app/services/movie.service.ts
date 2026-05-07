import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  adult: boolean;
  video: boolean;
  runtime?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private apiKey = '35afafd1cc281f164f0aa4def053c2ee'; 
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(private http: HttpClient) {}

  getPopularMovies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=pt-BR`);
  }

  getNowPlaying(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/now_playing?api_key=${this.apiKey}&language=pt-BR&page=1`);
  }

  getUpcoming(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/upcoming?api_key=${this.apiKey}&language=pt-BR&page=1`);
  }

  getTopRated(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}&language=pt-BR&page=1`);
  }

  getMoviesByGenre(genreId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/discover/movie?api_key=${this.apiKey}&with_genres=${genreId}&language=pt-BR&page=1`);
  }

  searchMovies(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query}&language=pt-BR`);
  }

  getMovieById(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&language=pt-BR`);
  }

  getPosterUrl(posterPath: string): string {
    if (!posterPath) return 'assets/default-poster.jpg';
    return `${this.imageBaseUrl}${posterPath}`;
  }

  getBackdropUrl(backdropPath: string): string {
    if (!backdropPath) return 'assets/default-backdrop.jpg';
    return `https://image.tmdb.org/t/p/original${backdropPath}`;
  }

  getMovieVideos(id: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/movie/${id}/videos?api_key=${this.apiKey}&language=pt-BR`);
}

}