import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {
  cartItemCount$: Observable<number>;

  constructor(
    private router: Router,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.cartItemCount$ = new Observable<number>(observer => {
      if (isPlatformBrowser(this.platformId)) {
        setInterval(() => {
          observer.next(this.cartService.getCartItemCount());
        }, 1000);
      } else {
        observer.next(0);
      }
    });
  }

  ngOnInit() {
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  getUserEmail(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('email') || 'User';
    }
    return 'User';
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      this.cartService.clearCart();
    }
    this.router.navigate(['/login']);
  }
} 