import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenue: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenue: 0
  };
  baseUrl = 'http://localhost:5229/api';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.checkAdminAccess();
    this.loadDashboardStats();
  }

  private checkAdminAccess() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // You might want to add additional admin role verification here
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get(`${this.baseUrl}/admin/verify`, { headers }).subscribe({
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  private loadDashboardStats() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<DashboardStats>(`${this.baseUrl}/admin/stats`, { headers })
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
          this.errorMessage = 'Failed to load dashboard statistics.';
        }
      });
  }
} 