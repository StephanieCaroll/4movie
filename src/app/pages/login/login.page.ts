import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logInOutline, personAddOutline, closeOutline } from 'ionicons/icons';
import { HeaderComponent } from '../../components/header/header.component';
import { AppwriteService } from '../../services/appwrite.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HeaderComponent]
})
export class LoginPage implements OnInit {
  private appwrite = inject(AppwriteService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  email = '';
  password = '';

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, logInOutline, personAddOutline, closeOutline });
  }

  public get itemCount(): number {
    return this.cartService.getItemCount();
  }

  async ngOnInit() {
    try {
      const session = await this.appwrite.getAccount();
      if (session) {
        this.router.navigate(['/profile']);
      }
    } catch (e) {
      // Usuário não está logado, permanece na tela
    }
  }

  async entrar() {
    const loading = await this.loadingCtrl.create({ message: 'Autenticando...' });
    await loading.present();

    try {
      await this.appwrite.login(this.email, this.password);
      await loading.dismiss();
      this.router.navigate(['/profile']);
    } catch (e: any) {
      await loading.dismiss();
      
      // Se já houver sessão ativa, manda pro perfil
      if (e.message.includes('session is active')) {
        this.router.navigate(['/profile']);
        return;
      }

      let msg = 'E-mail ou senha incorretos.';
      if (e.code === 401) msg = 'Credenciais inválidas.';
      
      this.exibirToast(msg, 'danger');
    }
  }

  irParaSignUp() {
    this.router.navigate(['/sign-up']);
  }

  async recuperarSenha() {
    this.exibirToast('Funcionalidade em desenvolvimento.', 'warning');
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