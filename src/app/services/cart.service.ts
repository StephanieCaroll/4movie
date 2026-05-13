import { Injectable, signal, computed, inject } from '@angular/core';
import { AppwriteService } from './appwrite.service';
import { UserService } from './user.service';
import { ID, Query } from 'appwrite';
import { ToastController, NavController } from '@ionic/angular';
import { CartItem } from './cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private appwrite = inject(AppwriteService);
  private userService = inject(UserService);
  private toastCtrl = inject(ToastController);
  private navCtrl = inject(NavController);
  
  private readonly DB_ID = '6a04e0420022f3b7ac95'; 
  private readonly COLLECTION_ID = 'cart_items';

  private cartSignal = signal<CartItem[]>([]);
  
  public items = computed(() => this.cartSignal());
  public itemCount = computed(() => this.cartSignal().length);
  public total = computed(() => 
    this.cartSignal().reduce((acc, item) => acc + item.price, 0)
  );

  constructor() {
    this.loadCart();
  }

  getItemCount(): number {
    return this.itemCount();
  }

  async loadCart() {
    const user = await this.userService.getCurrentUser();
    if (!user) return;

    try {
      const response = await this.appwrite.databases.listDocuments(
        this.DB_ID,
        this.COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );
      this.cartSignal.set(response.documents as unknown as CartItem[]);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  }

  async addToCart(movie: any, type: 'rent' | 'buy', days: number = 1) {
    const user = await this.userService.getCurrentUser();
    
    if (!user) {
      this.showToast('Faça login para adicionar itens', 'toast-warning');
      return;
    }

    const exists = this.cartSignal().find(
      item => item.movieId === movie.id && item.type === type
    );

    if (exists) {
      this.showToast('Este item já está no carrinho', 'toast-warning');
      this.navCtrl.navigateForward('/cart');
      return;
    }

    const basePrice = type === 'buy' ? 49.90 : 14.90;
    const finalPrice = type === 'rent' ? basePrice * days : basePrice;

    const newItem: CartItem = {
      userId: user.$id,
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      type: type,
      price: finalPrice,
      rentalDays: type === 'rent' ? days : undefined
    };

    try {
      const doc = await this.appwrite.databases.createDocument(
        this.DB_ID,
        this.COLLECTION_ID,
        ID.unique(),
        newItem
      );
      
      this.cartSignal.update(items => [...items, doc as unknown as CartItem]);
      this.showToast(`${movie.title} adicionado!`, 'toast-success');
      
      this.navCtrl.navigateForward('/cart');
    } catch (error) {
      console.error('Erro ao salvar no Appwrite:', error);
      this.showToast('Erro ao salvar. Verifique se as Permissões e Atributos foram criados.', 'toast-danger');
    }
  }

  async removeFromCart(documentId: string) {
    try {
      await this.appwrite.databases.deleteDocument(this.DB_ID, this.COLLECTION_ID, documentId);
      this.cartSignal.update(items => items.filter(item => item.$id !== documentId));
      this.showToast('Item removido', 'toast-success');
    } catch {
      this.showToast('Erro ao remover item', 'toast-danger');
    }
  }

  async clearCart() {
    const items = this.cartSignal();
    for (const item of items) {
      if (item.$id) await this.appwrite.databases.deleteDocument(this.DB_ID, this.COLLECTION_ID, item.$id);
    }
    this.cartSignal.set([]);
  }

  private async showToast(message: string, cssClass: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      cssClass: `custom-toast ${cssClass}`
    });
    await toast.present();
  }
}