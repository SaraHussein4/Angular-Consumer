import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface BasketItem {
  id: number;
  productId?: number;
  productName: string;
  pictureUrl: string;
  price: number;
  brand: string;
  type: string;
  quantity: number;
}


  
  export interface CustomerBasket {
    id: string;
    items: BasketItem[];
  }
  
  @Injectable({
    providedIn: 'root'
  })
  export class CartService {
    private baseUrl = 'http://localhost:5229/api';
    private defaultBasket: CustomerBasket = { id: 'basket1', items: [] };
    private cartSubject: BehaviorSubject<CustomerBasket>;
    cart$: Observable<CustomerBasket>;
  
    constructor(
      @Inject(PLATFORM_ID) private platformId: Object,
      private http: HttpClient
    ) {
      // Initialize with default empty basket
      this.cartSubject = new BehaviorSubject<CustomerBasket>(this.defaultBasket);
      this.cart$ = this.cartSubject.asObservable();
  
      if (isPlatformBrowser(this.platformId)) {
        this.initializeCart();
      }
    }
  
    private initializeCart(): void {
      try {
       
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (this.isValidBasket(parsedCart)) {
            this.cartSubject.next(parsedCart);
          } else {
            this.resetToDefaultBasket();
          }
        }
  
        // Then try to load from server
        this.loadCartFromServer();
      } catch (error) {
        console.error('Error initializing cart:', error);
        this.resetToDefaultBasket();
      }
    }
  
    private isValidBasket(basket: any): basket is CustomerBasket {
      return basket 
        && typeof basket === 'object'
        && typeof basket.id === 'string'
        && Array.isArray(basket.items);
    }
  
    private resetToDefaultBasket(): void {
      this.cartSubject.next(this.defaultBasket);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('cart', JSON.stringify(this.defaultBasket));
      }
    }
  
    getCurrentBasketId(): string {
      return this.cartSubject.value?.id || this.defaultBasket.id;
    }
  
    private loadCartFromServer(): void {
      if (!isPlatformBrowser(this.platformId)) return;
  
      const token = localStorage.getItem('token');
      if (!token) return;
  
      const basketId = this.getCurrentBasketId();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
      this.http.get<CustomerBasket>(`${this.baseUrl}/baskets/${basketId}`, { headers })
        .subscribe({
          next: (basket) => {
            if (basket && this.isValidBasket(basket)) {
              this.cartSubject.next(basket);
              this.saveCart();
            }
          },
          error: (error) => {
            if (error.status !== 404) {
              console.error('Error loading basket from server:', error);
            }
          }
        });
    }
  
    getCart(): Observable<BasketItem[]> {
      return new Observable<BasketItem[]>(observer => {
        this.cart$.subscribe(cart => {
          observer.next(cart?.items || []);
        });
      });
    }
  
    addToCart(item: Partial<BasketItem>): void {
      if (!isPlatformBrowser(this.platformId)) return;
      if (!item || !item.id) return;
  
      const currentCart = this.cartSubject.value || this.defaultBasket;
      const existingItem = currentCart.items?.find(i => i.id === item.id);
  
      let updatedCart: CustomerBasket;
  
      if (existingItem) {
        const updatedItems = currentCart.items.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, Quantity: cartItem.quantity + 1 }
            : cartItem
        );
        updatedCart = { ...currentCart, items: updatedItems };
      } else {
        const newItem: BasketItem = {
          id: item.id,
          productName: item.productName || '',
          pictureUrl: item.pictureUrl || '',
          price: item.price || 0,
          brand: item.brand || '',
          type: item.type || '',
          quantity: 1
        };
        updatedCart = {
          ...currentCart,
          items: [...(currentCart.items || []), newItem]
        };
      }
  
      this.cartSubject.next(updatedCart);
      this.saveCart();
      this.updateBasketOnServer(updatedCart);
    }
  
    removeFromCart(itemId: number): void {
      if (!isPlatformBrowser(this.platformId)) return;
  
      const currentCart = this.cartSubject.value || this.defaultBasket;
      const updatedItems = currentCart.items?.filter(item => item.id !== itemId) || [];
      const updatedCart = { ...currentCart, items: updatedItems };
      this.cartSubject.next(updatedCart);
      this.saveCart();
      this.updateBasketOnServer(updatedCart);
    }
  
    updateQuantity(itemId: number, quantity: number): void {
      if (!isPlatformBrowser(this.platformId)) return;
  
      const currentCart = this.cartSubject.value || this.defaultBasket;
      const updatedItems = currentCart.items?.map(item => 
        item.id === itemId ? { ...item, Quantity: quantity } : item
      ) || [];
      const updatedCart = { ...currentCart, items: updatedItems };
      this.cartSubject.next(updatedCart);
      this.saveCart();
      this.updateBasketOnServer(updatedCart);
    }
  
    clearCart(): void {
      if (!isPlatformBrowser(this.platformId)) return;
  
      this.resetToDefaultBasket();
      this.deleteBasketOnServer(this.defaultBasket.id);
    }
  
    private saveCart(): void {
      if (isPlatformBrowser(this.platformId)) {
        const currentCart = this.cartSubject.value;
        if (this.isValidBasket(currentCart)) {
          localStorage.setItem('cart', JSON.stringify(currentCart));
        }
      }
    }
  
    private updateBasketOnServer(basket: CustomerBasket): void {
      if (!isPlatformBrowser(this.platformId)) return;
      if (!this.isValidBasket(basket)) return;
  
      const token = localStorage.getItem('token');
      if (!token) return;
  
      const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');
  
      this.http.post<CustomerBasket>(`${this.baseUrl}/baskets`, basket, { headers }).subscribe({
        next: (response) => {
          if (response && this.isValidBasket(response)) {
            console.log('Basket updated on server:', response);
          }
        },
        error: (error) => {
          console.error('Error updating basket on server:', error);
        }
      });
    }
  
    private deleteBasketOnServer(basketId: string): void {
      if (!isPlatformBrowser(this.platformId)) return;
  
      const token = localStorage.getItem('token');
      if (!token) return;
  
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
      this.http.delete(`${this.baseUrl}/baskets?id=${basketId}`, { headers }).subscribe({
        next: () => {
          console.log('Basket deleted from server');
        },
        error: (error) => {
          console.error('Error deleting basket from server:', error);
        }
      });
    }
  
    getCartCount(): Observable<number> {
      return new Observable<number>(observer => {
        this.cart$.subscribe(cart => {
          const count = cart?.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
          observer.next(count);
        });
      });
    }
  
    getCartTotal(): Observable<number> {
      return new Observable<number>(observer => {
        this.cart$.subscribe(cart => {
          const total = cart?.items?.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 0)), 0) || 0;
          observer.next(total);
        });
      });
    }
  }