import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { addIcons } from 'ionicons';
import { trashOutline, cartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class CartPage {
  public cartService = inject(CartService);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ trashOutline, cartOutline });
  }

  async checkout() {
    const alert = await this.alertCtrl.create({
      header: 'Pedido Finalizado',
      message: 'Obrigado por escolher o 4MOVIE!',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.cartService.clearCart();
        }
      }]
    });
    await alert.present();
  }
}