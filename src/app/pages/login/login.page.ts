import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { AppwriteService } from '../../services/appwrite.service';
import { CartService } from '../../services/cart.service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HeaderComponent]
})
export class LoginPage {
  private appwrite = inject(AppwriteService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private cartService = inject(CartService);

  email = '';
  password = '';

  // Getter para satisfazer o [itemCount] do app-header no template
  get itemCount(): number {
    return this.cartService.getItemCount();
  }

  async entrar() {
    const loading = await this.loadingCtrl.create({ message: 'Autenticando...' });
    await loading.present();

    try {
      await this.appwrite.login(this.email, this.password);
      await loading.dismiss();
      this.router.navigate(['/profile'], { replaceUrl: true });
    } catch (e: any) {
      await loading.dismiss();
      this.exibirToast('E-mail ou senha incorretos.', 'danger');
    }
  }

  recuperarSenha() {
    // Lógica para recuperação de senha (ex: navegar para página de reset)
    this.exibirToast('Funcionalidade de recuperação em breve.', 'shared');
  }

  irParaSignUp() {
    this.router.navigate(['/sign-up']);
  }

  async exibirToast(msg: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: cor as any,
      position: 'top'
    });
    await toast.present();
  }
}