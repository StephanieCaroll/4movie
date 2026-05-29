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
    // Validações Locais 
    if (!this.nome.trim() || !this.email.trim() || !this.senha.trim()) {
      this.exibirToast('Preencha todos os campos para criar sua conta!', 'danger');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.exibirToast('O formato do e-mail digitado não é válido. Verifique se há algum erro de digitação.', 'danger');
      return;
    }

    if (this.senha.length < 8) {
      this.exibirToast('Sua senha está muito curta! Ela precisa ter no mínimo 8 caracteres para garantir sua segurança.', 'danger');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.exibirToast('As senhas digitadas não coincidem. Certifique-se de digitar a mesma senha nos dois campos.', 'danger');
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
      console.log('Efetuando login automático para:', this.email);
      await this.appwrite.login(this.email, this.senha);
      
      await loading.dismiss();
      this.exibirToast('Conta criada com sucesso! Seja bem-vindo(a).', 'success');
      
      // Limpa os campos do formulário
      this.nome = '';
      this.email = '';
      this.senha = '';
      this.confirmarSenha = '';
      this.router.navigate(['/profile']);
      
    } catch (error: any) {
      await loading.dismiss();
      console.error('Erro detalhado no cadastro:', error);
      
      // Mensagem padrão genérica caso o erro não caia nos mapeamentos abaixo
      let msg = 'Não foi possível criar sua conta neste momento. Verifique sua conexão ou tente novamente.';
      
      if (error?.type === 'user_already_exists' || error?.code === 409) {
        msg = 'Este endereço de e-mail já está sendo utilizado por outra conta registrada.';
      } else if (error?.type === 'password_too_short') {
        msg = 'O servidor recusou a senha: ela precisa ter pelo menos 8 caracteres.';
      } else if (error?.type === 'user_email_invalid' || error?.type === 'user_invalid_email') {
        msg = 'O servidor identificou este endereço de e-mail como inválido.';
      } else if (error?.type === 'user_password_invalid') {
        msg = 'A senha informada não atende aos requisitos de segurança recomendados.';
      } else if (error?.code === 400) {
        msg = 'Os dados enviados estão inválidos ou incompletos. Revise os campos.';
      } else if (error?.code === 500) {
        msg = 'Erro interno no servidor de autenticação. Por favor, tente novamente mais tarde.';
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
      duration: 4000, 
      color: cor === 'success' ? 'success' : undefined,
      position: 'bottom',
      buttons: cor !== 'success' ? [{ text: 'OK', role: 'cancel' }] : [],
      cssClass: cor === 'success' ? 'success-toast' : 'custom-toast'
    });
    await toast.present();
  }
}