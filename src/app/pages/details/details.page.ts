import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { 
  IonContent, IonSpinner, IonIcon, IonButton
} from '@ionic/angular/standalone';
import { MovieService, Movie } from '../../services/movie.service';
import { addIcons } from 'ionicons';
import { 
  star, 
  arrowBackOutline, 
  cartOutline, 
  heartOutline, 
  sadOutline, 
  homeOutline 
} from 'ionicons/icons';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    IonContent,
    IonSpinner,
    IonIcon,
    IonButton
  ]
})
export class DetailsPage implements OnInit {
  filme: Movie | null = null;
  loading: boolean = true;
  filmeId: string | null = null;
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(
    private route: ActivatedRoute,
    public movieService: MovieService,
    private cartService: CartService
  ) {
   
    addIcons({ 
      star, 
      arrowBackOutline, 
      cartOutline, 
      heartOutline, 
      sadOutline, 
      homeOutline 
    });
  }

  ngOnInit() {
    this.filmeId = this.route.snapshot.paramMap.get('id');
    console.log('ID do filme:', this.filmeId);
    
    if (this.filmeId) {
      this.carregarDetalhes(parseInt(this.filmeId));
    }
  }

  carregarDetalhes(id: number) {
    this.loading = true;
    this.movieService.getMovieById(id).subscribe({
      next: (filme) => {
        this.filme = filme;
        this.loading = false;
        console.log('✅ Detalhes carregados:', filme.title);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar detalhes:', err);
        this.loading = false;
      }
    });
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

  formatDate(date: string): string {
    if (!date) return 'Data não disponível';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  addToCart() {
    if (this.filme) {
      this.cartService.addToCart(this.filme, 1);
      console.log('Filme adicionado ao carrinho:', this.filme.title);
    }
  }
}