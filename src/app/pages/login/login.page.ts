import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { AppwriteService } from '../../services/appwrite.service';
import { CartService } from '../../services/cart.service';
import { UserMoviesService } from '../../services/user-movies.service';
import { RecentlyWatchedService } from '../../services/recently-watched.service';
import { addIcons } from 'ionicons';
import { 
  mailOutline, 
  lockClosedOutline, 
  logInOutline, 
  personAddOutline, 
  alertCircleOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginPage implements OnInit {
  private appwrite = inject(AppwriteService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private cartService = inject(CartService);
  private userMoviesService = inject(UserMoviesService);
  private recentlyWatchedService = inject(RecentlyWatchedService);

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor() {
    addIcons({
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'log-in-outline': logInOutline,
      'person-add-outline': personAddOutline,
      'alert-circle-outline': alertCircleOutline
    });
  }

  async ngOnInit() {
    try {
      const loggedIn = await this.appwrite.isLoggedIn();
      if (loggedIn) {
        console.log('Usuário já logado, redirecionando para profile');
        this.router.navigate(['/profile'], { replaceUrl: true });
      }
    } catch (error) {
      console.error('Erro ao verificar login no ngOnInit:', error);
    }
  }

  get itemCount(): number {
    return this.cartService.getItemCount();
  }

  async entrar() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Preencha todos os campos.';
      this.exibirToast(this.errorMessage, 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Digite um e-mail válido.';
      this.exibirToast(this.errorMessage, 'warning');
      return;
    }

    this.userMoviesService.reset();
    this.recentlyWatchedService.reset();

    this.errorMessage = '';
    this.isLoading = true;

    const loading = await this.loadingCtrl.create({ 
      message: 'Autenticando...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      console.log('Iniciando login para:', this.email);
      
      await this.appwrite.login(this.email, this.password);
      
      console.log('Login realizado, carregando dados...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      await Promise.all([
        this.cartService.loadCart(),
        this.userMoviesService.loadUserMovies(),
        this.recentlyWatchedService.loadRecentlyWatched()
      ]);

      await loading.dismiss();
      await this.exibirToast('Login realizado com sucesso!', 'success');
      
      console.log('Redirecionando para profile...');
      this.router.navigate(['/profile'], { replaceUrl: true });
      
    } catch (error: any) {
      await loading.dismiss();
      
      console.error('Erro completo no login:', error);
      
      if (error?.code === 401) {
        this.errorMessage = 'E-mail ou senha incorretos.';
        await this.exibirToast(this.errorMessage, 'danger');
      } else if (error?.code === 429) {
        this.errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
        await this.exibirToast(this.errorMessage, 'warning');
      } else {
        this.errorMessage = 'Erro ao fazer login. Verifique sua conexão.';
        await this.exibirToast(this.errorMessage, 'danger');
      }
    } finally {
      this.isLoading = false;
    }
  }

  recuperarSenha() {
    this.exibirToast('Funcionalidade de recuperação em breve.', 'warning');
  }

  irParaSignUp() {
    this.router.navigate(['/sign-up']);
  }

  async exibirToast(msg: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: cor as any,
      position: 'bottom',
      buttons: cor === 'danger' ? [{ text: 'OK', role: 'cancel' }] : [],
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}