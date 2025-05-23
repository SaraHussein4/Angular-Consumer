import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, BasketItem, CustomerBasket } from '../services/cart.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { DeliveryMethod, Order, ShippingAddress } from '../models/order';
import { Router } from '@angular/router';
import { take, catchError } from 'rxjs/operators';
import { throwError, Subscription } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  deliveryMethods: DeliveryMethod[] = [];
  isSubmitting = false;
  private baseUrl = 'http://localhost:5229/api';
  private modal: any;
  cartItems: BasketItem[] = [];
  total: number = 0;
  errorMessage: string = '';
  cartId: string | null = null;
  selectedDeliveryMethod: DeliveryMethod | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    public cartService: CartService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.checkoutForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
      deliveryMethodId: ['', Validators.required]
    });

    // Listen for delivery method changes
    const subscription = this.checkoutForm.get('deliveryMethodId')?.valueChanges.subscribe(methodId => {
      this.selectedDeliveryMethod = this.deliveryMethods.find(m => m.id === +methodId) || null;
    });

    if (subscription) {
      this.subscriptions.push(subscription);
    }
  }

  ngOnInit(): void {
    this.loadCart();
    this.loadDeliveryMethods();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCart(): void {
    const subscription = this.cartService.getCart().subscribe({
      next: (items: BasketItem[]) => {
        this.cartItems = items;
        this.updateTotal();
        this.createOrGetBasket();
      },
      error: (error: Error) => {
        console.error('Error loading cart:', error);
        this.errorMessage = 'Failed to load cart items. Please refresh the page.';
      }
    });
    this.subscriptions.push(subscription);
  }

  createOrGetBasket(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Please log in to continue.';
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const basketId = this.cartService.getCurrentBasketId();
    
    const subscription = this.http.get<CustomerBasket>(`${this.baseUrl}/baskets/${basketId}`, { headers })
      .pipe(
        catchError(error => {
          if (error.status === 404) {
            return this.createNewBasket(headers);
          }
          console.error('Error getting basket:', error);
          return throwError(() => new Error('Failed to load basket. Please try again.'));
        })
      )
      .subscribe({
        next: (response) => {
          if (response && response.id) {
            this.cartId = response.id;
          }
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    
    this.subscriptions.push(subscription);
  }

  private createNewBasket(headers: HttpHeaders) {
    const basketItems = this.cartItems.map(item => ({
      id: item.id,
      productId: item.id,
      productName: item.productName,
      pictureUrl: item.pictureUrl,
      price: item.price,
      brand: item.brand,
      type: item.type,
      quantity: item.quantity
    }));

    const basketData: CustomerBasket = {
      id: 'basket1',
      items: basketItems
    };

    return this.http.post<CustomerBasket>(`${this.baseUrl}/baskets`, basketData, { headers });
  }

  getSelectedDeliveryMethodCost(): number {
    return this.selectedDeliveryMethod?.cost || 0;
  }

  getTotalWithDelivery(): number {
    return this.total + this.getSelectedDeliveryMethodCost();
  }

  incrementQuantity(item: BasketItem): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  decrementQuantity(item: BasketItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
    } else {
      this.removeItem(item.id);
    }
  }

  loadDeliveryMethods(): void {
    const subscription = this.http.get<DeliveryMethod[]>(`${this.baseUrl}/orders/DeliveryMethods`).subscribe({
      next: (methods) => {
        this.deliveryMethods = methods;
      },
      error: (error) => {
        console.error('Error loading delivery methods:', error);
        this.errorMessage = 'Failed to load delivery methods.';
      }
    });
    this.subscriptions.push(subscription);
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId);
  }

  updateTotal(): void {
    const subscription = this.cartService.getCartTotal().subscribe(total => {
      this.total = total;
    });
    this.subscriptions.push(subscription);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  calculateTotal(items: BasketItem[]): number {
    return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  openCheckoutModal() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.cartItems.length === 0) {
      this.errorMessage = 'Your cart is empty';
      return;
    }

    this.modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    this.modal.show();
  }

  submitOrder() {
    if (this.checkoutForm.invalid) {
      Object.keys(this.checkoutForm.controls).forEach(key => {
        const control = this.checkoutForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    if (!this.cartId) {
      this.errorMessage = 'No valid basket found. Please try refreshing the page.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const selectedMethod = this.deliveryMethods.find(
      m => m.id === +this.checkoutForm.get('deliveryMethodId')?.value
    );

    if (!selectedMethod) {
      this.isSubmitting = false;
      this.errorMessage = 'Please select a delivery method.';
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.isSubmitting = false;
      this.errorMessage = 'Please log in to place an order.';
      this.router.navigate(['/login']);
      return;
    }

    const orderData = {
      basketId: this.cartId,
      deliveryMethodId: selectedMethod.id,
      shippingAddress: {
        firstName: this.checkoutForm.get('firstName')?.value,
        lastName: this.checkoutForm.get('lastName')?.value,
        street: this.checkoutForm.get('street')?.value,
        city: this.checkoutForm.get('city')?.value,
        country: this.checkoutForm.get('country')?.value
      }
    };

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    this.http.post<Order>(`${this.baseUrl}/orders`, orderData, { headers })
      .pipe(
        take(1),
        catchError((error: HttpErrorResponse) => {
          console.error('Error creating order:', error);
          let errorMessage = 'Failed to create order. Please try again.';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          }
          return throwError(() => new Error(errorMessage));
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Order created successfully:', response);
          this.cartService.clearCart();
          this.modal.hide();
          this.router.navigate(['/orders']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message;
        }
      });
  }
} 