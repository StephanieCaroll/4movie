import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, LoadingController } from '@ionic/angular';
import { AppwriteService } from '../../services/appwrite.service';
import { CartService } from '../../services/cart.service'; 
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HeaderComponent] 
})
export class ProfilePage implements OnInit {
  private appwrite = inject(AppwriteService);
  private cartService = inject(CartService); 
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);

  usuario: any = null;

  public get itemCount(): number {
    return this.cartService.getItemCount();
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ message: 'Carregando...' });
    await loading.present();

    try {
      this.usuario = await this.appwrite.getAccount();
    } catch (error) {
      this.router.navigate(['/login']);
    } finally {
      await loading.dismiss();
    }
  }

  async sair() {
    await this.appwrite.logout();
    this.router.navigate(['/login']);
  }
}