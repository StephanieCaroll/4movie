import { Component, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AppwriteService } from '../../services/appwrite.service';
import { CartService } from '../../services/cart.service';
import { UserMoviesService, UserMovie } from '../../services/user-movies.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, RouterModule]
})
export class ProfilePage implements OnInit, OnDestroy {
  private appwrite = inject(AppwriteService);
  private router = inject(Router);
  private cartService = inject(CartService);
  public userMoviesService = inject(UserMoviesService);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);

  usuario: any = null;
  carregando = true;
  selectedTab: string = 'all';
  errorMessage: string = '';
  
  private timerInterval: any;

  constructor() {
    // Efeito para re-filtrar sempre que os dados no serviço mudarem (Signals)
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
    
    // Atualiza cronômetros a cada minuto para refletir tempo restante de aluguel
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
    // Apenas para forçar detecção de mudanças se necessário
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  getRemainingTimeText(expiresAt?: string): string {
    if (!expiresAt) return '';
    return this.userMoviesService.getRemainingTimeDisplay(expiresAt);
  }

  // Função que abre os detalhes do filme clicado
  async watchMovie(movie: UserMovie) {
    try {
      // Verifica se o aluguel expirou antes de navegar
      if (movie.type === 'rent' && movie.expiresAt) {
        const now = new Date();
        const expires = new Date(movie.expiresAt);
        
        if (now > expires) {
          await this.userMoviesService.removeExpiredRentals();
          const toast = await this.toastCtrl.create({
            message: 'Este aluguel expirou!',
            duration: 2000,
            color: 'danger',
            position: 'bottom'
          });
          await toast.present();
          return;
        }
      }
      
      // Navega para a página de detalhes usando o ID do filme
      this.navCtrl.navigateForward(`/details/${movie.movieId}`);
      
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
      // Limpa dados locais antes de sair
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
}