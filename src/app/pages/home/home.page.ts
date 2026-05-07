import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonSearchbar, 
  IonContent, IonBadge, IonIcon, IonButton, IonFooter 
} from '@ionic/angular/standalone';
import { MovieService } from '../../services/movie.service';
import { CartService } from '../../services/cart.service';
import { GenreNamePipe } from '../../pipes/genre-name.pipe';
import { addIcons } from 'ionicons';
import { 
  filmOutline, cartOutline, starOutline, playCircleOutline,
  tvOutline, trophyOutline, sparklesOutline, heartOutline,
  addCircleOutline, arrowForwardOutline, menuOutline, closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    FormsModule,
    GenreNamePipe,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonSearchbar,
    IonContent, IonBadge, IonIcon, IonButton
  ]
})
export class HomePage implements OnInit {
  private movieService = inject(MovieService);
  private cartService = inject(CartService);
  
  public movies: any[] = [];
  public newReleases: any[] = [];
  public featuredMovie: any = null;
  public imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  public searchQuery = '';
  public isLoading = true;
  
  public get itemCount(): number {
    return this.cartService.getItemCount();
  }

  constructor() {
    addIcons({ 
      filmOutline, cartOutline, starOutline, playCircleOutline,
      tvOutline, trophyOutline, sparklesOutline, heartOutline,
      addCircleOutline, arrowForwardOutline, menuOutline, closeOutline
    });
  }

  ngOnInit() {
    this.loadMovies();
  }

  private loadMovies() {
    this.isLoading = true;
    this.movieService.getPopularMovies().subscribe({
      next: (res: any) => {
        this.movies = res.results;
        this.featuredMovie = this.movies[0];
        this.newReleases = this.movies.slice(4, 8);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar filmes:', err);
        this.isLoading = false;
      }
    });
  }

  onSearchChange(event: any) {
    const query = event.target.value;
    if (query && query.length > 2) {
      this.movieService.searchMovies(query).subscribe({
        next: (res: any) => {
          this.movies = res.results;
        },
        error: (err: any) => {
          console.error('Erro ao buscar filmes:', err);
        }
      });
    } else if (!query || query.length === 0) {
      this.loadMovies();
    }
  }

  getMoviePrice(movie: any): number {
    // Preço base baseado na popularidade e avaliação
    const basePrice = 5.9;
    const rating = movie.vote_average || 7;
    const popularity = movie.popularity || 100;
    
    // Filmes mais populares e bem avaliados são mais caros
    let price = basePrice;
    if (rating > 8) price += 2;
    else if (rating > 7) price += 1;
    
    if (popularity > 1000) price += 1.5;
    else if (popularity > 500) price += 0.5;
    
    return Math.min(price, 15.9); // Preço máximo de R$ 15,90
  }

  doRefresh(event: any) {
    this.loadMovies();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}