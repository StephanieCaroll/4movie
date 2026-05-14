import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { addIcons } from 'ionicons';
import { homeOutline, arrowBackOutline, cartOutline, heartOutline, sadOutline, playOutline, star, gridOutline, personOutline, closeOutline, searchOutline, imageOutline } from 'ionicons/icons';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class CategoriesPage implements OnInit {
  private movieService = inject(MovieService);
  private router = inject(Router);

  public genres: any[] = [];
  public imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  
  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;
  private currentSlider: HTMLElement | null = null;

  constructor() {
    addIcons({ 
      homeOutline, 
      arrowBackOutline, 
      cartOutline, 
      heartOutline, 
      sadOutline, 
      playOutline, 
      star, 
      gridOutline, 
      personOutline, 
      closeOutline, 
      searchOutline,
      imageOutline
    });
  }

  ngOnInit() {
  // Busca os gêneros normais
  this.movieService.getGenres().subscribe((res: any) => {
    this.genres = res.genres;

    // Adiciona "Populares" no início da lista para ele ser listado como os outros
    const popularGenre = { id: 'popular', name: 'Populares', movies: [] };
    this.genres.unshift(popularGenre);

    this.genres.forEach(genre => {
      if (genre.id === 'popular') {
        this.movieService.getPopularMovies().subscribe((movieRes: any) => {
          genre.movies = movieRes.results.slice(0, 10);
          setTimeout(() => this.initDragScroll(), 100);
        });
      } else {
        this.movieService.getMoviesByGenre(genre.id).subscribe((movieRes: any) => {
          genre.movies = movieRes.results.slice(0, 10);
          setTimeout(() => this.initDragScroll(), 100);
        });
      }
    });
  });
}

  initDragScroll() {
    const sliders = document.querySelectorAll('.horizontal-scroll');
    
    sliders.forEach((slider) => {
      const sliderElement = slider as HTMLElement;
      
      sliderElement.removeEventListener('mousedown', this.onMouseDown);
      sliderElement.removeEventListener('mouseleave', this.onMouseLeave);
      sliderElement.removeEventListener('mouseup', this.onMouseUp);
      sliderElement.removeEventListener('mousemove', this.onMouseMove);
      
      sliderElement.addEventListener('mousedown', this.onMouseDown);
      sliderElement.addEventListener('mouseleave', this.onMouseLeave);
      sliderElement.addEventListener('mouseup', this.onMouseUp);
      sliderElement.addEventListener('mousemove', this.onMouseMove);
    });
  }

  onMouseDown = (e: MouseEvent) => {
    const sliderElement = e.currentTarget as HTMLElement;
    this.isDragging = false;
    this.startX = e.pageX - sliderElement.offsetLeft;
    this.scrollLeft = sliderElement.scrollLeft;
    this.currentSlider = sliderElement;
    sliderElement.style.cursor = 'grabbing';
  }

  onMouseLeave = () => {
    this.isDragging = false;
    if (this.currentSlider) {
      this.currentSlider.style.cursor = 'grab';
      this.currentSlider = null;
    }
  }

  onMouseUp = () => {
    this.isDragging = false;
    if (this.currentSlider) {
      this.currentSlider.style.cursor = 'grab';
      this.currentSlider = null;
    }
  }

  onMouseMove = (e: MouseEvent) => {
    if (!this.isDragging && this.startX === 0) return;
    if (!this.currentSlider) return;
    
    const x = e.pageX - this.currentSlider.offsetLeft;
    const walk = (x - this.startX);
    
    if (Math.abs(walk) > 5) {
      this.isDragging = true;
    }

    if (this.isDragging) {
      e.preventDefault();
      this.currentSlider.scrollLeft = this.scrollLeft - walk;
    }
  }

  goToMovieDetails(event: MouseEvent, movieId: number) {

    if (this.isDragging) {
      event.stopPropagation();
      this.isDragging = false;
      return;
    }
    console.log('Navegando para o filme:', movieId);
    this.router.navigate(['/details', movieId]);
  }

 
}