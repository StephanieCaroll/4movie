import { Component, OnInit, OnDestroy, inject, effect } from '@angular/core';
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
export class ProfilePage implements OnInit, OnDestroy {
  private appwrite = inject(AppwriteService);
  private router = inject(Router);
  private cartService = inject(CartService);
  public userMoviesService = inject(UserMoviesService);

  usuario: any = null;
  carregando = true;
  selectedTab: string = 'all';
  errorMessage: string = '';
  
  private timerInterval: any;

  constructor() {
    // Efeito para re-filtrar sempre que os dados no serviço mudarem
    effect(() => {
      this.userMoviesService.movies();
      this.filterMovies();
    });
  }

  async ngOnInit() {
    await this.carregarPerfil();
    if (this.usuario) {
      await this.loadUserMovies();
    }
    
    // Atualiza cronômetros a cada minuto
    this.timerInterval = setInterval(() => {
      this.filterMovies();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  async carregarPerfil() {
    try {
      this.carregando = true;
      this.errorMessage = '';
      this.usuario = await this.appwrite.getAccount();
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      this.errorMessage = 'Sessão expirada. Faça login novamente.';
      setTimeout(() => {
        this.router.navigate(['/login'], { replaceUrl: true });
      }, 2000);
    } finally {
      this.carregando = false;
    }
  }

  async loadUserMovies() {
    if (!this.usuario) return;
    
    try {
      await this.userMoviesService.loadUserMovies();
    } catch (error) {
      console.error('Erro ao carregar filmes do usuário:', error);
      // Não mostra erro pro usuário, apenas loga
    }
  }

  // Retorna a lista de filmes baseada na aba selecionada
  get filteredMovies(): UserMovie[] {
    try {
      switch(this.selectedTab) {
        case 'purchased':
          return this.userMoviesService.purchasedMovies();
        case 'rented':
          return this.userMoviesService.rentedMovies();
        default:
          return this.userMoviesService.movies();
      }
    } catch (error) {
      console.error('Erro ao filtrar filmes:', error);
      return [];
    }
  }

  filterMovies() {
    // Força a atualização da UI quando necessário
    // O getter filteredMovies já lida com a lógica
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  getRemainingTimeText(expiresAt?: string): string {
    if (!expiresAt) return '';
    return this.userMoviesService.getRemainingTimeDisplay(expiresAt);
  }

  async watchMovie(movie: UserMovie) {
    try {
      // Verifica se o filme ainda está disponível
      if (movie.type === 'rent' && movie.expiresAt) {
        const now = new Date();
        const expires = new Date(movie.expiresAt);
        
        if (now > expires) {
          await this.userMoviesService.removeExpiredRentals();
          const toast = document.createElement('ion-toast');
          toast.message = 'Este aluguel expirou!';
          toast.duration = 2000;
          toast.color = 'danger';
          document.body.appendChild(toast);
          await toast.present();
          return;
        }
      }
      
      console.log('Assistir filme:', movie);
      // TODO: Implementar player
      // this.router.navigate(['/player', movie.movieId]);
      
    } catch (error) {
      console.error('Erro ao acessar filme:', error);
    }
  }

  async refreshMovies() {
    await this.userMoviesService.refreshUserMovies();
  }

  async sair() {
    try {
      await this.appwrite.logout();
      this.cartService.clearLocalCart();
      this.userMoviesService.movies().length = 0; // Limpa filmes localmente
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, tenta navegar para login
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
}