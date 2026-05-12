import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { CartService } from '../../services/cart.service';
import { AppwriteService } from '../../services/appwrite.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HeaderComponent]
})
export class SignUpPage {
  private cartService = inject(CartService);
  private appwrite = inject(AppwriteService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  // Variáveis ligadas ao seu formulário
  nome = '';
  email = '';
  telefone = '';
  senha = '';
  confirmarSenha = '';

  public get itemCount(): number {
    return this.cartService.getItemCount();
  }

  async cadastrar() {
    // Validação básica
    if (!this.nome || !this.email || !this.senha) {
      this.exibirToast('Preencha os campos obrigatórios para comprar seus filmes.', 'warning');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.exibirToast('As senhas digitadas não são iguais.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Criando sua conta de cinema...',
      spinner: 'crescent',
      cssClass: 'custom-loading' // Estilizaremos no SCSS
    });
    await loading.present();

    try {
      // Chamada ao Appwrite
      // IMPORTANTE: O erro 401 costuma ser falta de configuração de "Platform" no console do Appwrite
      await this.appwrite.createAccount(this.email, this.senha, this.nome);
      
      await loading.dismiss();
      this.exibirToast('Conta criada! Agora você já pode comprar seus filmes.', 'success');
      this.router.navigate(['/login']);
    } catch (e: any) {
      await loading.dismiss();
      // Se o erro 401 persistir, verifique o Project ID no AppwriteService
      this.exibirToast('Erro de autorização: Verifique as configurações do Appwrite.', 'danger');
      console.error('Erro Appwrite:', e);
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
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }
}