import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface OrderItem {
  productName: string;
  pictureUrl: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  country: string;
}

interface Order {
  id: number;
  orderDate: string;
  status: string;
  total: number;
  subTotal: number;
  deliverymethod: string;
  deliveryMethodCost: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  private baseUrl = 'http://localhost:5229/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<Order[]>(`${this.baseUrl}/Orders`, { headers }).subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-info';
      case 'processing':
        return 'bg-warning';
      case 'completed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }
} 