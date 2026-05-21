import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonButtons, IonMenuButton, 
  IonSearchbar, IonButton, IonIcon 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { gridOutline, personOutline, cartOutline, closeOutline, searchOutline, star } from 'ionicons/icons';
import { MovieService } from '../../services/movie.service';
import { CartService } from '../../services/cart.service';
import { LazyLoadDirective } from '../../directives/lazy-load';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'], 
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, 
    IonSearchbar, IonButton, IonIcon, LazyLoadDirective
  ]
})
export class HeaderComponent implements OnInit {
  private movieService = inject(MovieService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  public cartService = inject(CartService); 
  
  public searchQuery: string = '';
  public isSearching: boolean = false;
  public searchResults: any[] = [];
  private searchTimeout: any;
  
  public imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  
  @Output() searchQueryChange = new EventEmitter<string>();

  constructor() {
    addIcons({ gridOutline, personOutline, cartOutline, closeOutline, searchOutline, star });
  }

  ngOnInit() {
    
  }

  get itemCount(): number {
    return this.cartService.itemCount();
  }

  onSearchChange(event: any) {
    const query = event.detail?.value || '';
    this.searchQuery = query;
    
    this.searchQueryChange.emit(this.searchQuery);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (this.searchQuery.trim().length > 0) {
      this.searchTimeout = setTimeout(() => {
        this.isSearching = true;
        
        this.movieService.searchMovies(this.searchQuery).subscribe({
          next: (res: any) => {
            this.searchResults = res.results || [];
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Erro na busca:', err);
            this.searchResults = [];
            this.cdr.detectChanges();
          }
        });
      }, 300);
    } else {
      this.isSearching = false;
      this.searchResults = [];
      this.cdr.detectChanges();
    }
  }

  navigateToMovie(movieId: number) {
    this.router.navigate(['/details', movieId]).then(() => {
      this.isSearching = false;
      this.searchQuery = '';
      this.searchResults = [];
      this.cdr.detectChanges();
    }).catch(err => {
      console.error('Erro na navegação:', err);
      this.isSearching = false;
      this.searchQuery = '';
      this.searchResults = [];
      this.cdr.detectChanges();
    });
  }

  closeSearch() {
    this.isSearching = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.searchQueryChange.emit('');
    this.cdr.detectChanges();
  }
}