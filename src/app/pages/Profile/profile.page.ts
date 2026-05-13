import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { AppwriteService } from '../../services/appwrite.service';
import { CartService } from '../../services/cart.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HeaderComponent, FormsModule]
})
export class ProfilePage implements OnInit {
  private appwrite = inject(AppwriteService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private modalCtrl = inject(ModalController);

  usuario: any = null;
  carregando = true; // Controle do Skeleton Screen
  editNome = '';

  public get itemCount(): number {
    return this.cartService.getItemCount();
  }

  async ngOnInit() {
    await this.carregarPerfil();
  }

  async carregarPerfil() {
    this.carregando = true;
    try {
      this.usuario = await this.appwrite.getAccount();
      this.editNome = this.usuario.name;
    } catch (error) {
      this.router.navigate(['/login']);
    } finally {
      this.carregando = false;
    }
  }

  async sair() {
    await this.appwrite.logout();
    this.router.navigate(['/login']);
  }

  // Lógica para o Modal de Edição 
  async salvarEdicao() {
    try {
      // No Appwrite real: await this.appwrite.account.updateName(this.editNome);
      this.usuario.name = this.editNome;
      await this.modalCtrl.dismiss();
      this.exibirToast('Perfil atualizado!', 'success');
    } catch (e) {
      this.exibirToast('Erro ao atualizar.', 'danger');
    }
  }

  async exibirToast(msg: string, cor: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color: cor as any });
    await toast.present();
  }
}