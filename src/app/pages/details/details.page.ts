import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonContent, IonSpinner, IonIcon, IonButton, IonBadge, IonSelect, IonSelectOption, IonItem, IonLabel } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { CartService } from '../../services/cart.service';
import { UserMoviesService } from '../../services/user-movies.service';
import { GenreNamePipe } from '../../pipes/genre-name.pipe';
import { addIcons } from 'ionicons';
import { 
  star, arrowBackOutline, cartOutline, heartOutline, 
  sadOutline, homeOutline, playOutline, timeOutline,
  calendarOutline, globeOutline, cashOutline, peopleOutline,
  infiniteOutline, checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    IonContent, 
    IonSpinner, 
    IonIcon, 
    IonButton,
    IonBadge,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    GenreNamePipe
  ]
})
export class DetailsPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  public movieService = inject(MovieService);
  private cartService = inject(CartService);
  private userMoviesService = inject(UserMoviesService);
  private sanitizer = inject(DomSanitizer);

  filme: any = null;
  loading: boolean = true;
  trailerUrl: SafeResourceUrl | null = null;
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  
  // Opções de preço
  selectedType: 'rent' | 'buy' = 'rent';
  selectedDays: number = 1;
  rentPricePerDay: number = 9.90;
  buyPrice: number = 14.90;
  
  // Opções de dias disponíveis
  daysOptions = [
    { value: 1, label: '1 dia' },
    { value: 2, label: '2 dias' },
    { value: 3, label: '3 dias' },
    { value: 5, label: '5 dias' },
    { value: 7, label: '7 dias' }
  ];

  constructor() {
    addIcons({ 
      star, arrowBackOutline, cartOutline, heartOutline, 
      sadOutline, homeOutline, playOutline, timeOutline,
      calendarOutline, globeOutline, cashOutline, peopleOutline,
      infiniteOutline, checkmarkCircleOutline
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

  carregarDetalhes(id: number) {
    this.loading = true;
    this.movieService.getMovieById(id).subscribe({
      next: (filme) => {
        this.filme = filme;
        this.loading = false;
        this.carregarTrailer(id);
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Verifica se o usuário pode comprar ou alugar o filme.
   * Se já comprou ou tem aluguel ativo, retorna false.
   */
  get canPurchase(): boolean {
    if (!this.filme) return false;
    return this.userMoviesService.canTransact(this.filme.id);
  }

  /**
   * Retorna o texto do botão de ação baseado no status de posse.
   */
  get buttonText(): string {
    if (!this.filme) return 'Carregando...';
    
    const movie = this.userMoviesService.movies().find(m => m.movieId === this.filme.id);
    
    if (movie) {
      if (movie.type === 'buy') return 'Filme já Adquirido';
      if (movie.type === 'rent' && !this.canPurchase) return 'Aluguel Ativo';
    }
    
    return this.selectedType === 'buy' ? 'Comprar Agora' : 'Alugar Filme';
  }

  translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Released': 'Lançado',
      'Post Production': 'Pós-Produção',
      'In Production': 'Em Produção',
      'Planned': 'Planejado',
      'Canceled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  formatRuntime(runtime: number): string {
    if (!runtime) return 'N/D';
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes}m`;
  }

  carregarTrailer(id: number) {
    this.movieService.getMovieVideos(id).subscribe(res => {
      const trailer = res.results?.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
      if (trailer) {
        this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`
        );
      }
    });
  }

  voltar() {
    this.navCtrl.back();
  }

  ngOnDestroy() {
    this.trailerUrl = null;
  }

  get currentPrice(): number {
    if (this.selectedType === 'buy') {
      return this.buyPrice;
    } else {
      return this.rentPricePerDay * this.selectedDays;
    }
  }

  get formattedPrice(): string {
    return `R$ ${this.currentPrice.toFixed(2)}`;
  }

  get formattedRentPricePerDay(): string {
    return `R$ ${this.rentPricePerDay.toFixed(2)}`;
  }

  async addToCart() {
    if (this.filme && this.canPurchase) {
      if (this.selectedType === 'buy') {
        await this.cartService.addToCart(this.filme, 'buy');
      } else {
        await this.cartService.addToCart(this.filme, 'rent', this.selectedDays);
      }
    }
  }
}