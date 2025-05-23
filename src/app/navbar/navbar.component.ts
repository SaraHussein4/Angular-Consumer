import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  baseUrl = 'http://localhost:5229/api';
  cartItemCount: number = 0;

  constructor(
    public cartService: CartService,
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.cartService.getCartCount().subscribe(count => {
      this.cartItemCount = count;
    });
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return localStorage.getItem('role') === 'admin';
  }

  getUserEmail(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('email');
  }

  logout() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Call the logout endpoint
    this.http.post(`${this.baseUrl}/account/logout`, {}).subscribe({
      next: () => {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        
        // Navigate to login page
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
        // Still clear local storage and redirect even if the server call fails
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        this.router.navigate(['/login']);
      }
    });
  }
}