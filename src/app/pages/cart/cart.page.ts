import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { addIcons } from 'ionicons';
import { trashOutline, cartOutline } from 'ionicons/icons';
import { LazyLoadDirective } from '../../directives/lazy-load';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, LazyLoadDirective]
})
export class CartPage {
  public cartService = inject(CartService);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ trashOutline, cartOutline });
  }

  async checkout() {
    const items = this.cartService.items();
    
    if (items.length === 0) {
      const emptyAlert = await this.alertCtrl.create({
        header: 'Carrinho Vazio',
        message: 'Adicione filmes antes de finalizar.',
        buttons: ['OK']
      });
      await emptyAlert.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Finalizar Pedido',
      message: `Deseja confirmar a compra de ${items.length} item(ns)?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            await this.cartService.completePurchase(items);
          }
        }
      ]
    });
    await alert.present();
  }
}