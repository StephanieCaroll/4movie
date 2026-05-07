import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonSearchbar, 
  IonContent, IonIcon, IonButton, IonSpinner
} from '@ionic/angular/standalone';
import { MovieService } from '../../services/movie.service';
import { CartService } from '../../services/cart.service';
import { addIcons } from 'ionicons';
import { 
  searchOutline, personOutline, cartOutline, star, 
  play, addCircleOutline, menuOutline, gridOutline 
} from 'ionicons/icons';
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
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonSearchbar,
    IonContent, IonIcon, IonButton, IonSpinner
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
  
  public isSearching: boolean = false;
  public searchResults: any[] = [];
  public searchQuery = '';
  
  public imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  public imageBaseUrlOriginal = 'https://image.tmdb.org/t/p/original'; 
  
  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;
  
  public get itemCount(): number {
    return this.cartService.getItemCount();
  }

  constructor() {
    addIcons({ 
      searchOutline, personOutline, cartOutline, star, 
      play, addCircleOutline, menuOutline, gridOutline
    });
  }

  ngOnInit() {
    this.loadAllMovies();
    this.initDragScroll();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const swiperEl = document.querySelector('swiper-container');
      if (swiperEl && swiperEl.swiper) {
        swiperEl.swiper.autoplay.start();
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
          
          const handleMouseMove = (e: MouseEvent) => {
            const x = e.pageX - sliderElement.offsetLeft;
            const walk = (x - this.startX);
            if (Math.abs(walk) > 5) {
              this.isDragging = true;
            }
            if (this.isDragging) {
              e.preventDefault();
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
      
      console.group('🎬 [APRESENTAÇÃO] Requisito: Consumo da API com método GET');
      console.log('📦 1. Resposta Bruta Completa (JSON):', res);
      if (res.results && res.results.length > 0) {
        console.log('🔍 2. Estrutura específica de UM filme (Primeiro item):', res.results[0]);
        console.log('📊 3. Tabela com os principais dados extraídos:');
        console.table(res.results.slice(0, 5), ['id', 'title', 'release_date', 'vote_average', 'original_language']);
      }
      console.groupEnd();
      
      this.popularMovies = res.results.slice(0, 10);
      
      const top4 = res.results.slice(0, 4);
      const detailRequests = top4.map((m: any) => this.movieService.getMovieById(m.id));
      
      forkJoin(detailRequests).subscribe((details: any) => {
        this.carouselMovies = details;
        
        setTimeout(() => {
          const swiperEl = document.querySelector('swiper-container');
          if (swiperEl && swiperEl.swiper) {
            swiperEl.swiper.autoplay.start();
          }
        }, 100);
      });
    });

    this.movieService.getNowPlaying().subscribe((res: any) => {
      this.nowPlayingMovies = res.results.slice(0, 10);
    });

    this.movieService.getUpcoming().subscribe((res: any) => {
      this.upcomingMovies = res.results.slice(0, 10);
    });

    this.movieService.getTopRated().subscribe((res: any) => {
      this.topRatedMovies = res.results.slice(0, 10);
    });

    this.movieService.getMoviesByGenre(28).subscribe((res: any) => {
      this.actionMovies = res.results.slice(0, 10);
    });

    this.movieService.getMoviesByGenre(35).subscribe((res: any) => {
      this.comedyMovies = res.results.slice(0, 10);
    });
  }

  onSearchChange(event: any) {
    const query = event.target.value?.trim() || '';
    
    if (query.length > 0) {
      this.isSearching = true;
     
      if (query.length >= 1) {
        this.movieService.searchMovies(query).subscribe((res: any) => {
          
          console.group(`🔎 [APRESENTAÇÃO] Requisito: Busca Dinâmica na API por "${query}"`);
          console.log(`Total de resultados encontrados para "${query}":`, res.total_results);
          if (res.results && res.results.length > 0) {
            console.table(res.results.slice(0, 5), ['title', 'popularity']);
          }
          console.groupEnd();

          this.searchResults = res.results;
        });
      } else {
        this.searchResults = [];
      }
    } else {
      
      this.isSearching = false;
      this.searchResults = [];
    }
  }
}