import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CartService } from '../services/cart.service';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  img: string;
  productBrandId: number;
  productTypeId: number;
  productBrand: string;
  productType: string;
}

interface PaginatedResponse<T> {
  pageSize: number;
  pageIndex: number;
  count: number;
  data: T[];
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  baseUrl = 'http://localhost:5229/api';
  errorMessage: string = '';
  
  // Pagination
  pageSize: number = 5;
  pageIndex: number = 1;
  totalItems: number = 0;
  
  // Search
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router, 
    private http: HttpClient,
    private cartService: CartService
  ) {
    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.pageIndex = 1; // Reset to first page on new search
      this.loadProducts();
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  onSearch(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  loadProducts() {
    let params = new HttpParams()
      .set('pageSize', this.pageSize.toString())
      .set('pageIndex', this.pageIndex.toString());

    if (this.searchTerm) {
      params = params.set('search', this.searchTerm);
    }

    this.http.get<PaginatedResponse<Product>>(`${this.baseUrl}/product`, { params })
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.totalItems = res.count;
          console.log('Products loaded:', this.products);
        },
        error: (err) => {
          console.error('Failed to load products', err);
          this.errorMessage = 'Failed to load products. Please try again later.';
        }
      });
  }

  onPageChange(page: number) {
    this.pageIndex = page;
    this.loadProducts();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pages(): number[] {
    const pageCount = this.totalPages;
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  addToCart(product: Product): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    console.log('Adding product to cart:', product);

    this.cartService.addToCart({
      id: product.id,
      productId: product.id,
      productName: product.name,
      pictureUrl: product.img || '',
      price: product.price,
      brand: product.productBrand,
      type: product.productType,
      quantity: 1
    });
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Please log in to add items to cart';
      return false;
    }
    return true;
  }
}
