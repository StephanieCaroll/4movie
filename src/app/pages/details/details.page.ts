import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonContent, IonSpinner, IonIcon, IonButton } from '@ionic/angular/standalone';
import { MovieService, Movie } from '../../services/movie.service';
import { CartService } from '../../services/cart.service';
import { addIcons } from 'ionicons';
import { 
  star, arrowBackOutline, cartOutline, heartOutline, 
  sadOutline, homeOutline, playOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, IonSpinner, IonIcon, IonButton]
})
export class DetailsPage implements OnInit, OnDestroy {
  filme: Movie | null = null;
  loading: boolean = true;
  erro: boolean = false; 
  trailerUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public movieService: MovieService,
    private cartService: CartService,
    private sanitizer: DomSanitizer
  ) {
    addIcons({ 
      star, arrowBackOutline, cartOutline, heartOutline, 
      sadOutline, homeOutline, playOutline 
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.carregarDetalhes(parseInt(id));
      }
    });
  }

  voltar() {
    this.trailerUrl = null; 
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  ngOnDestroy() {
    this.trailerUrl = null;
  }

  carregarDetalhes(id: number) {
    this.loading = true;
    this.erro = false;
    this.movieService.getMovieById(id).subscribe({
      next: (filme) => {
        this.filme = filme;
        this.loading = false;
        this.carregarTrailer(id);
      },
      error: (err) => {
        console.error('Erro:', err);
        this.loading = false;
        this.erro = true;
      }
    });
  }

  carregarTrailer(id: number) {
    this.movieService.getMovieVideos(id).subscribe(res => {
      const trailer = res.results.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
      if (trailer) {
       
        this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${trailer.key}?rel=0&showinfo=0&controls=1`
        );
      }
    });
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString('pt-BR') : 'Data N/D';
  }

  getGenreNames(genreIds: number[]): string {
    const genres: { [key: number]: string } = {
      28: 'Ação', 12: 'Aventura', 16: 'Animação', 35: 'Comédia',
      80: 'Crime', 99: 'Documentário', 18: 'Drama', 10751: 'Família',
      14: 'Fantasia', 36: 'História', 27: 'Terror', 10402: 'Música',
      9648: 'Mistério', 10749: 'Romance', 878: 'Ficção Científica',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'Guerra', 37: 'Faroeste'
    };
    return genreIds.map(id => genres[id] || 'Geral').join(', ');
  }

  addToCart() {
    if (this.filme) this.cartService.addToCart(this.filme, 1);
  }
}