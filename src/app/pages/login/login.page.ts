import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { CartService } from '../../services/cart.service';
import { AppwriteService } from '../../services/appwrite.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HeaderComponent]
})
export class LoginPage {
  private cartService = inject(CartService);
  private appwrite = inject(AppwriteService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  email = '';
  password = '';

  public get itemCount(): number {
    return this.cartService.getItemCount();
  }

  async entrar() {
    if (!this.email || !this.password) {
      this.exibirToast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    if (!this.validarEmail(this.email)) {
      this.exibirToast('Por favor, insira um e-mail válido', 'warning');
      return;
    }

    try {
      await this.appwrite.login(this.email, this.password);
      this.exibirToast('Login realizado com sucesso!', 'success');
      this.router.navigate(['/profile']);
    } catch (e: any) {
      this.exibirToast('Erro ao entrar: ' + e.message, 'danger');
    }
  }

  async recuperarSenha() {
    const alert = await this.alertCtrl.create({
      header: 'Recuperar Palavra-passe',
      message: 'Digite seu e-mail para receber as instruções de recuperação',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'seu@email.com',
          attributes: {
            inputmode: 'email'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Enviar',
          handler: (data) => {
            if (data.email && this.validarEmail(data.email)) {
              this.exibirToast('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success');
            } else {
              this.exibirToast('Por favor, insira um e-mail válido.', 'warning');
              return false;
            }
            return true;
          }
        }
      ],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  irParaSignUp() {
    this.router.navigate(['/sign-up']);
  }

  async exibirToast(msg: string, tipo: 'success' | 'danger' | 'warning' = 'danger') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'top',
      color: tipo,
      buttons: [
        {
          icon: 'close-outline',
          role: 'cancel',
          handler: () => {}
        }
      ]
    });
    await toast.present();
  }

  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}