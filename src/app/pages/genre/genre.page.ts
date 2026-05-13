import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { MovieService, Movie } from '../../services/movie.service';
import { addIcons } from 'ionicons';
import { arrowBackOutline, star } from 'ionicons/icons';

@Component({
  selector: 'app-genre',
  templateUrl: './genre.page.html',
  styleUrls: ['./genre.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class GenrePage implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private location = inject(Location);

  public movies: Movie[] = [];
  public genreName: string = 'Carregando...'; 
  public genreId!: number;
  public currentPage: number = 1;
  public totalPages: number = 1;
  public isLoading: boolean = false;
  public imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor() {
    addIcons({ arrowBackOutline, star });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.genreId = +id;
      this.loadGenreName(); 
      this.loadMovies();
    }
  }

  loadGenreName() {
    this.movieService.getGenres().subscribe({
      next: (res: any) => {
        const genre = res.genres.find((g: any) => g.id === this.genreId);
        if (genre) this.genreName = genre.name;
      },
      error: () => {
        this.genreName = 'Filmes';
      }
    });
  }

  loadMovies() {
    if (this.isLoading) return;
    this.isLoading = true;

    this.movieService.getMoviesByGenre(this.genreId, this.currentPage).subscribe({
      next: (res: any) => {
        this.movies = [...this.movies, ...res.results];
        this.totalPages = res.total_pages;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadMore() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadMovies();
    }
  }

  goBack() {
    this.location.back();
  }
}