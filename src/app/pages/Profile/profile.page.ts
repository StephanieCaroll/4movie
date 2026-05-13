import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AppwriteService } from '../../services/appwrite.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ProfilePage implements OnInit {
  private appwrite = inject(AppwriteService);
  private router = inject(Router);
  private cartService = inject(CartService);

  usuario: any = null;
  carregando = true;

  async ngOnInit() {
    await this.carregarPerfil();
  }

  async carregarPerfil() {
    try {
      this.usuario = await this.appwrite.getAccount();
    } catch (error) {
      this.router.navigate(['/login'], { replaceUrl: true });
    } finally {
      this.carregando = false;
    }
  }

  async sair() {
    await this.appwrite.logout();
    this.cartService.clearLocalCart(); 
    this.router.navigate(['/login']);
  }
}