import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface OrderItem {
  productName: string;
  pictureUrl: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  buyerEmail: string;
  orderDate: string;
  shipToAddress: string;
  deliveryMethod: string;
  shippingPrice: number;
  orderItems: OrderItem[];
  subtotal: number;
  total: number;
  status: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>Orders Management</h2>

      <!-- Orders Table -->
      <div class="table-responsive mt-4">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td>#{{ order.id }}</td>
              <td>{{ order.buyerEmail }}</td>
              <td>{{ order.orderDate | date:'medium' }}</td>
              <td>{{ order.total | currency }}</td>
              <td>
                <select class="form-select form-select-sm" 
                        [(ngModel)]="order.status"
                        (change)="updateOrderStatus(order.id, order.status)">
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-primary" (click)="showOrderDetails(order)">
                  <i class="bi bi-eye"></i> View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Order Details Modal -->
      <div class="modal" [class.show]="selectedOrder" [style.display]="selectedOrder ? 'block' : 'none'">
        <div class="modal-dialog modal-lg">
          <div class="modal-content" *ngIf="selectedOrder">
            <div class="modal-header">
              <h5 class="modal-title">Order #{{ selectedOrder.id }} Details</h5>
              <button type="button" class="btn-close" (click)="closeOrderDetails()"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <h6>Customer Information</h6>
                  <p><strong>Email:</strong> {{ selectedOrder.buyerEmail }}</p>
                  <p><strong>Shipping Address:</strong> {{ selectedOrder.shipToAddress }}</p>
                </div>
                <div class="col-md-6">
                  <h6>Order Information</h6>
                  <p><strong>Order Date:</strong> {{ selectedOrder.orderDate | date:'medium' }}</p>
                  <p><strong>Delivery Method:</strong> {{ selectedOrder.deliveryMethod }}</p>
                  <p><strong>Status:</strong> {{ selectedOrder.status }}</p>
                </div>
              </div>

              <h6>Order Items</h6>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of selectedOrder.orderItems">
                      <td>
                        <div class="d-flex align-items-center">
                          <img [src]="item.pictureUrl" [alt]="item.productName" class="product-thumbnail me-2">
                          {{ item.productName }}
                        </div>
                      </td>
                      <td>{{ item.price | currency }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.price * item.quantity | currency }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" class="text-end"><strong>Subtotal:</strong></td>
                      <td>{{ selectedOrder.subtotal | currency }}</td>
                    </tr>
                    <tr>
                      <td colspan="3" class="text-end"><strong>Shipping:</strong></td>
                      <td>{{ selectedOrder.shippingPrice | currency }}</td>
                    </tr>
                    <tr>
                      <td colspan="3" class="text-end"><strong>Total:</strong></td>
                      <td>{{ selectedOrder.total | currency }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeOrderDetails()">Close</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" *ngIf="selectedOrder"></div>
    </div>
  `,
  styles: [`
    .product-thumbnail {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
    }
    .modal {
      background-color: rgba(0, 0, 0, 0.5);
    }
    .form-select-sm {
      min-width: 120px;
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private baseUrl = 'http://localhost:5229/api';
  orders: Order[] = [];
  selectedOrder: Order | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<Order[]>(`${this.baseUrl}/orders`, { headers }).subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  updateOrderStatus(orderId: number, status: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`${this.baseUrl}/orders/${orderId}/status`, { status }, { headers }).subscribe({
      next: () => {
        console.log('Order status updated successfully');
      },
      error: (error) => {
        console.error('Error updating order status:', error);
      }
    });
  }

  showOrderDetails(order: Order) {
    this.selectedOrder = order;
  }

  closeOrderDetails() {
    this.selectedOrder = null;
  }
} 