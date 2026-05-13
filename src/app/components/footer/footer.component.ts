import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline, gridOutline, personOutline, cartOutline } from 'ionicons/icons';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None ,
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class FooterComponent {
  private router = inject(Router);
  private cartService = inject(CartService);

  constructor() {
    addIcons({ homeOutline, gridOutline, personOutline, cartOutline });
  }

  get itemCount(): number {
    return this.cartService.getItemCount();
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}