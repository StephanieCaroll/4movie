import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonIcon, IonButton
} from '@ionic/angular/standalone';
import { MovieService } from '../../services/movie.service';
import { CartService } from '../../services/cart.service';
import { addIcons } from 'ionicons';
import { star, play, addCircleOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';



import { register } from 'swiper/element/bundle';
register(); 

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
  imports: [
    CommonModule, RouterModule, RouterLink, FormsModule,
    IonContent, IonIcon, IonButton
  ]
})
export class HomePage implements OnInit, AfterViewInit {
  private movieService = inject(MovieService);
  private cartService = inject(CartService);
  private router = inject(Router);
  
  public popularMovies: any[] = [];
  public nowPlayingMovies: any[] = [];
  public upcomingMovies: any[] = [];
  public topRatedMovies: any[] = [];
  public actionMovies: any[] = [];
  public comedyMovies: any[] = [];
  public carouselMovies: any[] = []; 
  public horrorMovies: any[] = [];
  public romanceMovies: any[] = [];
  public animationMovies: any[] = [];
  
  public imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  public imageBaseUrlOriginal = 'https://image.tmdb.org/t/p/original'; 
  
  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;
  
  public get itemCount(): number {
    return this.cartService.getItemCount();
  }

  constructor() {
    addIcons({ star, play, addCircleOutline });
  }

  ngOnInit() {
    this.loadAllMovies();
    this.initDragScroll();
  }

  ngAfterViewInit() {
    this.startAutoplay();
  }

  private startAutoplay() {
    setTimeout(() => {
      const swiperEl = document.querySelector('swiper-container');
      if (swiperEl && (swiperEl as any).swiper) {
        (swiperEl as any).swiper.autoplay.start();
      }
    }, 500);
  }

  initDragScroll() {
    setTimeout(() => {
      const sliders = document.querySelectorAll('.horizontal-scroll');
      sliders.forEach((slider) => {
        const sliderElement = slider as HTMLElement;
        sliderElement.addEventListener('mousedown', (e: MouseEvent) => {
          this.isDragging = false;
          this.startX = e.pageX - sliderElement.offsetLeft;
          this.scrollLeft = sliderElement.scrollLeft;
          
          const handleMouseMove = (ev: MouseEvent) => {
            const x = ev.pageX - sliderElement.offsetLeft;
            const walk = (x - this.startX);
            if (Math.abs(walk) > 5) this.isDragging = true;
            if (this.isDragging) {
              ev.preventDefault();
              sliderElement.scrollLeft = this.scrollLeft - walk;
            }
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        });
        sliderElement.style.cursor = 'grab';
      });
    }, 100);
  }

  onCardClick(event: MouseEvent, movieId: number) {
    if (this.isDragging) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false;
      return;
    }
    this.router.navigate(['/details', movieId]);
  }

  loadAllMovies() {
   
    this.movieService.getPopularMovies().subscribe((res: any) => {
      this.popularMovies = res.results.slice(0, 10);
      const top4 = res.results.slice(0, 4);
      const detailRequests = top4.map((m: any) => this.movieService.getMovieById(m.id));
      
      forkJoin(detailRequests).subscribe((details: any) => {
        this.carouselMovies = details;
        this.startAutoplay();
      });
    });

    this.movieService.getNowPlaying().subscribe((res: any) => this.nowPlayingMovies = res.results.slice(0, 10));
    this.movieService.getUpcoming().subscribe((res: any) => this.upcomingMovies = res.results.slice(0, 10));
    this.movieService.getTopRated().subscribe((res: any) => this.topRatedMovies = res.results.slice(0, 10));
    // Filmes de Ação (ID: 28)
    this.movieService.getMoviesByGenre(28).subscribe((res: any) => this.actionMovies = res.results.slice(0, 10));
    // Filmes de Comédia (ID: 35)
    this.movieService.getMoviesByGenre(35).subscribe((res: any) => this.comedyMovies = res.results.slice(0, 10));
    // Filmes de Terror (ID: 27)
    this.movieService.getMoviesByGenre(27).subscribe((res: any) => {this.horrorMovies = res.results.slice(0, 10);});
    // Filmes de Romance (ID: 10749)
    this.movieService.getMoviesByGenre(10749).subscribe((res: any) => {this.romanceMovies = res.results.slice(0, 10);});
    // Filmes de Animação (ID: 16)
    this.movieService.getMoviesByGenre(16).subscribe((res: any) => {this.animationMovies = res.results.slice(0, 10);});
    }

}