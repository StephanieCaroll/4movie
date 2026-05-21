import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { CartService } from '../../services/cart.service';
import { AppwriteService } from '../../services/appwrite.service';

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

  // Dados do formulário
  nome = '';
  email = '';
  telefone = '';
  senha = '';
  confirmarSenha = '';

  // Estado do Usuário
  usuarioLogado: any = null;

  public get itemCount(): number {
    return this.cartService.getItemCount();
  }

  async ngOnInit() {
    await this.verificarSessao();
  }

  async verificarSessao() {
    try {
      this.usuarioLogado = await this.appwrite.getAccount();
    } catch (e) {
      this.usuarioLogado = null;
    }
  }

  async cadastrar() {
    if (!this.nome.trim() || !this.email.trim() || !this.senha.trim()) {
      this.exibirToast('Preencha os campos para garantir seu ingresso!', 'warning');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.exibirToast('As senhas não coincidem.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Criando sua conta de cinema...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.appwrite.createAccount(this.email, this.senha, this.nome);
      await loading.dismiss();
      this.exibirToast('Conta criada! Faça login para começar.', 'success');
      this.router.navigate(['/login']);
    } catch (e: any) {
      await loading.dismiss();
      let msg = 'Erro ao criar conta. Tente novamente.';
      if (e.code === 409) msg = 'Este e-mail já está em uso em nossa base.';
      this.exibirToast(msg, 'danger');
    }
  }

  async logout() {
    const loading = await this.loadingCtrl.create({ message: 'Encerrando sessão...' });
    await loading.present();
    try {
      await this.appwrite.logout();
      this.usuarioLogado = null;
      this.exibirToast('Até logo! Sessão encerrada.', 'success');
    } catch (e) {
      this.exibirToast('Erro ao sair.', 'danger');
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
    buttons: [{ icon: 'close', role: 'cancel' }],
    cssClass: 'custom-toast'
  });
  await toast.present();
}
}