import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonContent, IonSpinner, IonIcon, IonButton, IonBadge, IonSelect, IonSelectOption, IonItem, IonLabel, ModalController, ToastController } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { CartService } from '../../services/cart.service';
import { UserMoviesService } from '../../services/user-movies.service';
import { FavoritesService } from '../../services/favorites.service'; 
import { GenreNamePipe } from '../../pipes/genre-name.pipe';
import { addIcons } from 'ionicons';
import { CompactNumberPipe } from '../../pipes/compact-number-pipe';
import { PlayerModalComponent } from '../../components/player-modal/player-modal.component';
import { 
  star, arrowBackOutline, cartOutline, heartOutline, heart, 
  sadOutline, homeOutline, playOutline, timeOutline,
  calendarOutline, globeOutline, cashOutline, peopleOutline,
  infiniteOutline, checkmarkCircleOutline, play, lockClosedOutline
} from 'ionicons/icons';

import { LazyLoadDirective } from '../../directives/lazy-load';

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
    GenreNamePipe,
    CompactNumberPipe,
    LazyLoadDirective
  ]
})
export class DetailsPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  public movieService = inject(MovieService);
  private cartService = inject(CartService);
  private userMoviesService = inject(UserMoviesService);
  public favoritesService = inject(FavoritesService); 
  private sanitizer = inject(DomSanitizer);
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);

  filme: any = null;
  loading: boolean = true;
  trailerUrl: SafeResourceUrl | null = null;
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  
  selectedType: 'rent' | 'buy' = 'rent';
  selectedDays: number = 1;
  rentPricePerDay: number = 9.90;
  buyPrice: number = 14.90;
  
  daysOptions = [
    { value: 1, label: '1 dia' },
    { value: 2, label: '2 dias' },
    { value: 3, label: '3 dias' },
    { value: 5, label: '5 dias' },
    { value: 7, label: '7 dias' }
  ];

  constructor() {
    addIcons({ 
      star, arrowBackOutline, cartOutline, heartOutline, heart, 
      sadOutline, homeOutline, playOutline, timeOutline,
      calendarOutline, globeOutline, cashOutline, peopleOutline,
      infiniteOutline, checkmarkCircleOutline, play, lockClosedOutline
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

  get jaComprei(): boolean {
    if (!this.filme) return false;
    return this.userMoviesService.movies().some(m => m.movieId === this.filme.id && m.type === 'buy');
  }

  get jaAluguei(): boolean {
    if (!this.filme) return false;
    const aluguel = this.userMoviesService.movies().find(m => m.movieId === this.filme.id && m.type === 'rent');
    if (!aluguel) return false;
    
    // Confirma se o prazo do aluguel não expirou
    if (aluguel.expiresAt) {
      return new Date() < new Date(aluguel.expiresAt);
    }
    return true;
  }

  translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Released': 'Lançado', 'Post Production': 'Pós-Produção',
      'In Production': 'Em Produção', 'Planned': 'Planejado', 'Canceled': 'Cancelado'
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

  toggleFavorite() {
    if (this.filme) {
      this.favoritesService.toggleFavorite(this.filme);
    }
  }

  get isFavorite(): boolean {
    if (!this.filme) return false;
    return this.favoritesService.isFavorite(this.filme.id);
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
    if (!this.filme) return;

    if (this.selectedType === 'rent' && this.jaAluguei) {
      this.exibirToast('Você já possui um aluguel ativo para este filme.');
      return;
    }

    if (this.jaComprei) {
      this.exibirToast('Você já adquiriu este filme permanentemente.');
      return;
    }

    if (this.selectedType === 'buy') {
      await this.cartService.addToCart(this.filme, 'buy');
    } else {
      await this.cartService.addToCart(this.filme, 'rent', this.selectedDays);
    }
  }

  async darPlayNoFilme() {
    if (!this.jaComprei && !this.jaAluguei) {
      this.exibirToast('Acesso negado. Você precisa alugar ou comprar o filme para assistir.');
      return;
    }

    const modal = await this.modalCtrl.create({
      component: PlayerModalComponent,
      componentProps: {
        filme: this.filme
      }
    });

    await modal.present();
    
    await modal.onDidDismiss();
    this.userMoviesService.loadUserMovies();
  }

  async exibirToast(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2500,
      position: 'bottom',
      color: 'dark',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}