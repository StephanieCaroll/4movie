import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { CartService } from '../../services/cart.service';
import { AppwriteService } from '../../services/appwrite.service';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  mailOutline, 
  lockClosedOutline, 
  checkmarkDoneCircleOutline,
  personCircle,
  logOutOutline,
  arrowForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class SignUpPage implements OnInit {
  private cartService = inject(CartService);
  private appwrite = inject(AppwriteService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  usuarioLogado: any = null;
  isLoading = false;

  constructor() {
    addIcons({
      'person-outline': personOutline,
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'checkmark-done-circle-outline': checkmarkDoneCircleOutline,
      'person-circle': personCircle,
      'log-out-outline': logOutOutline,
      'arrow-forward-outline': arrowForwardOutline
    });
  }

  public get itemCount(): number {
    return this.cartService.getItemCount();
  }

  async ngOnInit() {
    await this.verificarSessao();
  }

  async verificarSessao() {
    try {
     
      const user = await this.appwrite.getAccount();
      this.usuarioLogado = user;
      if (user) {
        console.log('Usuário logado:', user);
      } else {
        console.log('Nenhum usuário logado');
      }
    } catch (error) {
      this.usuarioLogado = null;
      console.log('Erro ao verificar sessão');
    }
  }

  async cadastrar() {
    if (!this.nome.trim() || !this.email.trim() || !this.senha.trim()) {
      this.exibirToast('Preencha todos os campos para criar sua conta!', 'warning');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.exibirToast('As senhas não coincidem.', 'warning');
      return;
    }

    if (this.senha.length < 8) {
      this.exibirToast('A senha deve ter no mínimo 8 caracteres.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.exibirToast('Digite um e-mail válido.', 'warning');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Criando sua conta de cinema...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      console.log('Criando conta para:', this.email);
      
      await this.appwrite.createAccount(this.email, this.senha, this.nome);
      
      await loading.dismiss();
      this.exibirToast('Conta criada com sucesso! Faça login para começar.', 'success');
      
      this.nome = '';
      this.email = '';
      this.senha = '';
      this.confirmarSenha = '';
      
      this.router.navigate(['/login']);
      
    } catch (error: any) {
      await loading.dismiss();
      
      console.error('Erro no cadastro:', error);
      
      let msg = 'Erro ao criar conta. Tente novamente.';
      if (error?.code === 409) {
        msg = 'Este e-mail já está em uso. Tente outro e-mail.';
      } else if (error?.code === 400) {
        msg = 'Dados inválidos. Verifique suas informações.';
      }
      
      this.exibirToast(msg, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async logout() {
    const loading = await this.loadingCtrl.create({ 
      message: 'Encerrando sessão...',
      spinner: 'crescent'
    });
    await loading.present();
    
    try {
      await this.appwrite.logout();
      this.usuarioLogado = null;
      this.exibirToast('Até logo! Sessão encerrada com sucesso.', 'success');
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
      
    } catch (error: any) {
      console.error('Erro no logout:', error);
      this.exibirToast('Erro ao sair. Tente novamente.', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  voltarParaLogin() {
    this.router.navigate(['/login']);
  }

  async exibirToast(msg: string, cor: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: cor,
      position: 'bottom',
      buttons: cor === 'danger' ? [{ text: 'OK', role: 'cancel' }] : [],
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}