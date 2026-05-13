import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonContent, IonSpinner, IonIcon, IonButton, IonBadge } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { MovieService } from '../../services/movie.service';
import { CartService } from '../../services/cart.service';
import { GenreNamePipe } from '../../pipes/genre-name.pipe';
import { addIcons } from 'ionicons';
import { 
  star, arrowBackOutline, cartOutline, heartOutline, 
  sadOutline, homeOutline, playOutline, timeOutline,
  calendarOutline, globeOutline, cashOutline, peopleOutline
} from 'ionicons/icons';

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
    IonButton,
    IonBadge,
    GenreNamePipe
  ]
})
export class DetailsPage implements OnInit, OnDestroy {
  filme: any = null;
  loading: boolean = true;
  trailerUrl: SafeResourceUrl | null = null;
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController, 
    public movieService: MovieService,
    private cartService: CartService, //
    private sanitizer: DomSanitizer
  ) {
    addIcons({ 
      star, arrowBackOutline, cartOutline, heartOutline, 
      sadOutline, homeOutline, playOutline, timeOutline,
      calendarOutline, globeOutline, cashOutline, peopleOutline
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

  
  async addToCart() {
    if (this.filme) {
      await this.cartService.addToCart(this.filme, 'buy'); //
    }
  }
}