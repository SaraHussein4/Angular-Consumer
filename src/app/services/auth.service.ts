import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

interface LoginResponse {
  token: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5229/api';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      this.loadCurrentUser();
    }
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/account/login`, {
      email,
      password
    }).pipe(
      map(response => {
        // Store token
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response);

        // Redirect based on role
        if (response.roles && response.roles.includes('Admin')) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/products']);
        }

        return response;
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.roles?.includes('Admin') || false;
  }

  private loadCurrentUser() {
    // You might want to add an API endpoint to get current user details
    // For now, we'll just check the token existence
    const token = localStorage.getItem('token');
    if (token) {
      // You can decode the JWT token here to get user info
      // For now, we'll just set a basic user object
      this.currentUserSubject.next({
        token,
        email: 'Admin1@gmail.com',
        roles: ['Admin']
      });
    }
  }
} 