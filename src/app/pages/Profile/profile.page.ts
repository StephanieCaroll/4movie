import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AppwriteService } from '../../services/appwrite.service';
import { CartService } from '../../services/cart.service';
import { UserMoviesService, UserMovie } from '../../services/user-movies.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  private appwrite = inject(AppwriteService);
  private router = inject(Router);
  private cartService = inject(CartService);
  private userMoviesService = inject(UserMoviesService);

  usuario: any = null;
  carregando = true;
  userMovies: UserMovie[] = [];
  selectedTab: string = 'all';
  filteredMovies: UserMovie[] = [];

  async ngOnInit() {
    await this.carregarPerfil();
    await this.loadUserMovies();
  }

  async carregarPerfil() {
    try {
      this.usuario = await this.appwrite.getAccount();
    } catch (error) {
      this.router.navigate(['/login'], { replaceUrl: true });
    } finally {
      this.carregando = false;
    }
  }

  async loadUserMovies() {
    await this.userMoviesService.loadUserMovies();
    this.userMovies = this.userMoviesService.movies();
    this.filterMovies();
    
    // Verifica aluguéis expirados
    await this.userMoviesService.removeExpiredRentals();
  }

  filterMovies() {
    switch(this.selectedTab) {
      case 'purchased':
        this.filteredMovies = this.userMoviesService.purchasedMovies();
        break;
      case 'rented':
        this.filteredMovies = this.userMoviesService.rentedMovies();
        break;
      default:
        this.filteredMovies = this.userMovies;
    }
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
    this.filterMovies();
  }

  getDaysRemaining(expiresAt: string): number {
    return this.userMoviesService.getDaysRemaining(expiresAt);
  }

  watchMovie(movie: UserMovie) {
    // Navegar para página de player do filme
    console.log('Assistir filme:', movie);
    // this.router.navigate(['/player', movie.movieId]);
  }

  async sair() {
    await this.appwrite.logout();
    this.cartService.clearLocalCart(); 
    this.router.navigate(['/login']);
  }
}