import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, HeaderComponent]
})
export class CategoriesPage implements OnInit, AfterViewInit {
  private movieService = inject(MovieService);
  private router = inject(Router);

  public genres: any[] = [];
  public imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  // Variáveis para o controle de arraste
  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;

  ngOnInit() {
    this.movieService.getGenres().subscribe((res: any) => {
      this.genres = res.genres;
      this.genres.forEach(genre => {
        this.movieService.getMoviesByGenre(genre.id).subscribe((movieRes: any) => {
          genre.movies = movieRes.results.slice(0, 10);
          // Reinicializa o scroll sempre que novos filmes entram na tela
          this.initDragScroll();
        });
      });
    });
  }

  ngAfterViewInit() {
    this.initDragScroll();
  }

  initDragScroll() {
    // Pequeno timeout para garantir que o *ngFor renderizou os elementos
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
            
            if (Math.abs(walk) > 5) {
              this.isDragging = true;
            }

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
    }, 200);
  }

  onCardClick(event: MouseEvent, movieId: number) {
    // Se o usuário estava arrastando, não navega para os detalhes
    if (this.isDragging) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false;
      return;
    }
    this.router.navigate(['/details', movieId]);
  }
}