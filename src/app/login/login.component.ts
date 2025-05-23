import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AccountService, LoginDto, UserDto } from '../services/account.service';

interface LoginModel {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginModel: LoginModel = {
    email: '',
    password: ''
  };
  errorMessage: string = '';
  baseUrl = 'http://localhost:5229/api';
  adminEmails = ['admin1@gmail.com', 'Admin1@gmail.com']; // Add admin emails here

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Check if user is already logged in
      const token = localStorage.getItem('token');
      if (token) {
        const role = localStorage.getItem('role');
        console.log('Current role:', role);
        if (this.isAdminEmail(localStorage.getItem('email'))) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/products']);
        }
      }
    }
  }

  // Helper methods for template
  getCurrentRole(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('role') || 'none';
    }
    return 'none';
  }

  hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  isAdminEmail(email: string | null): boolean {
    return email ? this.adminEmails.includes(email.toLowerCase()) : false;
  }

  onSubmit() {
    if (!this.loginModel.email || !this.loginModel.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.http.post(`${this.baseUrl}/account/login`, this.loginModel, { headers }).subscribe({
      next: (response: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', response.email);
          localStorage.setItem('role', response.role);
        }
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Login error:', error);
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else {
          this.errorMessage = 'An error occurred during login. Please try again.';
        }
      }
    });
  }
}
