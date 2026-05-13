import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { AppwriteService } from '../../services/appwrite.service';
import { CartService } from '../../services/cart.service';
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

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor() {
    // Registrar ícones para uso no componente
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
    // Validação básica
    if (!this.email || !this.password) {
      this.errorMessage = 'Preencha todos os campos.';
      this.exibirToast(this.errorMessage, 'warning');
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const loading = await this.loadingCtrl.create({ 
      message: 'Autenticando...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Tenta realizar o login
      await this.appwrite.login(this.email, this.password);
      await loading.dismiss();
      await this.cartService.loadCart()
    
      // Exibe toast de sucesso
      await this.exibirToast('Login realizado com sucesso!', 'success');
      
      // Navega para o perfil
      this.router.navigate(['/profile'], { replaceUrl: true });
      
    } catch (error: any) {
      await loading.dismiss();
      
      // Tratamento detalhado de erros
      if (error?.code === 401) {
        this.errorMessage = 'E-mail ou senha incorretos. Verifique suas credenciais.';
        await this.exibirToast(this.errorMessage, 'danger');
      } else if (error?.code === 404) {
        this.errorMessage = 'Usuário não encontrado.';
        await this.exibirToast(this.errorMessage, 'danger');
      } else if (error?.code === 429) {
        this.errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
        await this.exibirToast(this.errorMessage, 'warning');
      } else {
        this.errorMessage = 'Erro ao fazer login. Tente novamente.';
        await this.exibirToast(this.errorMessage, 'danger');
        console.error('Erro detalhado:', error);
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