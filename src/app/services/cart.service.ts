import { Injectable, signal, computed, inject } from '@angular/core';
import { AppwriteService } from './appwrite.service';
import { UserService } from './user.service';
import { UserMoviesService } from './user-movies.service';
import { ID, Query } from 'appwrite';
import { ToastController, NavController } from '@ionic/angular';
import { CartItem } from './cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private appwrite = inject(AppwriteService);
  private userService = inject(UserService);
  private userMoviesService = inject(UserMoviesService);
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

    const rentPricePerDay = 9.90;  
    const buyPrice = 14.90;        
    
    const basePrice = type === 'buy' ? buyPrice : rentPricePerDay;
    const finalPrice = type === 'rent' ? basePrice * days : basePrice;

    const newItem: CartItem = {
      userId: user.$id,
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      type: type,
      price: finalPrice,
      rentalDays: type === 'rent' ? days.toString() : undefined
    };

    try {
      const doc = await this.appwrite.databases.createDocument(
        this.DB_ID,
        this.COLLECTION_ID,
        ID.unique(),
        newItem
      );
      
      this.cartSignal.update(items => [...items, doc as unknown as CartItem]);
      
      const message = type === 'buy' 
        ? `${movie.title} adicionado para compra!` 
        : `${movie.title} alugado por ${days} dia(s)!`;
      
      this.showToast(message, 'toast-success');
      
      this.navCtrl.navigateForward('/cart');
    } catch (error) {
      console.error('Erro ao salvar no Appwrite:', error);
      this.showToast('Erro ao salvar no banco de dados.', 'toast-danger');
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
    this.showToast('Carrinho limpo com sucesso', 'toast-success');
  }

  // Método para finalizar compra/aluguel e mover para biblioteca do usuário
  async completePurchase(cartItems: CartItem[]) {
    let successCount = 0;
    
    for (const item of cartItems) {
      const movieData = {
        id: item.movieId,
        title: item.title,
        poster_path: item.posterPath
      };
      
      const success = await this.userMoviesService.addMovie(
        movieData,
        item.type,
        item.price,
        item.rentalDays ? parseInt(item.rentalDays) : undefined
      );
      
      if (success) {
        await this.removeFromCart(item.$id!);
        successCount++;
      }
    }
    
    if (successCount === cartItems.length) {
      this.showToast('Compra finalizada com sucesso!', 'toast-success');
      this.navCtrl.navigateBack('/profile');
    } else if (successCount > 0) {
      this.showToast(`${successCount} de ${cartItems.length} itens processados`, 'toast-warning');
    }
  }

  clearLocalCart() {
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