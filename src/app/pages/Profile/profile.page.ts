import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AppwriteService } from '../../services/appwrite.service';
import { CartService } from '../../services/cart.service';
import { UserMoviesService, UserMovie } from '../../services/user-movies.service';
import { RecentlyWatchedService } from '../../services/recently-watched.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, RouterModule]
})
export class ProfilePage {
  private appwrite = inject(AppwriteService);
  private router = inject(Router);
  private cartService = inject(CartService);
  public userMoviesService = inject(UserMoviesService);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);
  private recentlyWatchedService = inject(RecentlyWatchedService);

  usuario: any = null;
  carregando = true;
  selectedTab: string = 'all';
  errorMessage: string = '';
  
  editName: string = '';
  avatarUrl: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  isUpdating = false;
  
  private timerInterval: any;

  constructor() {
    effect(() => {
      this.userMoviesService.movies();
      this.filterMovies();
    });
  }

  async ionViewWillEnter() {
    await this.carregarPerfil();
    if (this.usuario) {
      await this.loadUserMovies();
    }
    
    this.timerInterval = setInterval(() => {
      this.filterMovies();
    }, 60000);
  }

  ionViewWillLeave() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  async carregarPerfil() {
    try {
      this.carregando = true;
      this.errorMessage = '';
      this.usuario = await this.appwrite.getAccount();
      
      this.editName = this.usuario.name;
      if (this.usuario.prefs && this.usuario.prefs.avatarId) {
        this.avatarUrl = this.appwrite.getAvatarUrl(this.usuario.prefs.avatarId);
      } else {
        this.avatarUrl = 'https://ionicframework.com/docs/img/demos/avatar.svg';
      }

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

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarUrl = e.target.result;
    };
    reader.readAsDataURL(file);

    try {
      const toastCarregando = await this.toastCtrl.create({
        message: 'Enviando nova foto de perfil...',
        duration: 1500,
        color: 'dark',
        position: 'bottom'
      });
      await toastCarregando.present();

      const upload = await this.appwrite.uploadAvatar(file);
      
      await this.appwrite.updatePrefs({ 
        ...this.usuario.prefs, 
        avatarId: upload.$id 
      });
     
      await this.carregarPerfil();

      const toastSucesso = await this.toastCtrl.create({
        message: 'Foto de perfil atualizada com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toastSucesso.present();

    } catch (error) {
      console.error('Erro ao salvar foto de perfil:', error);
      const toastErro = await this.toastCtrl.create({
        message: 'Erro ao salvar a imagem no servidor.',
        duration: 2500,
        color: 'danger',
        position: 'bottom'
      });
      await toastErro.present();
      
      this.carregarPerfil();
    }
  }

  async salvarEdicao(modal: any) {
    if (!this.editName.trim()) return;
    
    this.isUpdating = true;
    try {
      if (this.editName !== this.usuario.name) {
        await this.appwrite.updateProfileName(this.editName);
      }

      await this.carregarPerfil();
      
      const toast = await this.toastCtrl.create({
        message: 'Nome atualizado com sucesso!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      modal.dismiss();

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      const toast = await this.toastCtrl.create({
        message: 'Erro ao salvar alterações.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isUpdating = false;
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
      return [];
    }
  }

  filterMovies() {}

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  getRemainingTimeText(expiresAt?: string): string {
    if (!expiresAt) return '';
    return this.userMoviesService.getRemainingTimeDisplay(expiresAt);
  }

  async watchMovie(movie: UserMovie) {
    try {
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
      this.navCtrl.navigateForward(`/details/${movie.movieId}`);
    } catch (error) {
      console.error('Erro ao acessar filme:', error);
    }
  }

  async sair() {
  try {
    
    this.userMoviesService.reset();
    this.recentlyWatchedService.reset();

    await this.appwrite.logout();
    
    window.location.href = '/login'; 
  } catch (error) {
    window.location.href = '/login';
  }
}
}