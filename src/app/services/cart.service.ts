import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  movie: any;
  rentalDays: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  addToCart(movie: any, days: number): void {
    const existing = this.items.find(item => item.movie.id === movie.id);
    if (existing) {
      existing.rentalDays = days;
    } else {
      this.items.push({ movie, rentalDays: days });
    }
    this.itemsSubject.next(this.items);
  }

  removeFromCart(movieId: number): void {
    this.items = this.items.filter(item => item.movie.id !== movieId);
    this.itemsSubject.next(this.items);
  }

  clearCart(): void {
    this.items = [];
    this.itemsSubject.next(this.items);
  }

  getItems(): CartItem[] {
    return this.items;
  }

  getItemCount(): number {
    return this.items.length;
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.movie.price || 5.9) * item.rentalDays, 0);
  }
}