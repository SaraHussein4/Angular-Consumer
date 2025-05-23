import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Admin Dashboard</h2>
      <div class="row mt-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Products Management</h5>
              <p class="card-text">Manage your store's products - add, edit, or remove products.</p>
              <a routerLink="/admin/products" class="btn btn-primary">Manage Products</a>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Orders Management</h5>
              <p class="card-text">View and manage customer orders, update order status.</p>
              <a routerLink="/admin/orders" class="btn btn-primary">Manage Orders</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: transform 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card:hover {
      transform: translateY(-5px);
    }
  `]
})
export class AdminDashboardComponent {} 