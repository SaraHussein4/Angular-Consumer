import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { RouterModule } from '@angular/router';
import { TruncatePipe } from '../../pipes/truncate.pipe';

interface ProductBrand {
  id: number;
  name: string;
}

interface ProductType {
  id: number;
  name: string;
}

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
  quantity: number;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TruncatePipe
  ],
  templateUrl: './admin-products.component.html',
  styles: [`
    .product-image {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      border-radius: 4px;
      overflow: hidden;
    }

    .product-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .no-image {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: #f8f9fa;
      color: #adb5bd;
    }

    .no-image i {
      font-size: 1.5rem;
    }

    .product-info {
      max-width: 500px;
    }

    .description {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-group {
      gap: 0.5rem;
    }

    .badge {
      font-size: 0.875rem;
    }

    .table > :not(caption) > * > * {
      vertical-align: middle;
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  public baseUrl = 'http://localhost:5229/api';
  products: Product[] = [];
  brands: ProductBrand[] = [];
  types: ProductType[] = [];
  showForm = false;
  editingProduct = false;
  currentProduct: Product = this.getEmptyProduct();
  selectedFile: File | null = null;
  isLoading = true;
  loadError: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading = true;
    this.loadError = null;
    
    const token = localStorage.getItem('token');
    if (!token) {
      this.handleError('Authentication token not found');
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Cache-Control', 'no-cache')
      .set('Pragma', 'no-cache');

    forkJoin({
      brands: this.http.get<ProductBrand[]>(`${this.baseUrl}/Product/Brands`, { headers }),
      types: this.http.get<ProductType[]>(`${this.baseUrl}/Product/Types`, { headers }),
      products: this.http.get<Product[]>(`${this.baseUrl}/Product`, { headers })
    }).subscribe({
      next: (results) => {
        console.log('API Response:', results);
        this.brands = results.brands;
        this.types = results.types;
        this.products = results.products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.handleError('Failed to load data. Please try again.');
      }
    });
  }

  private handleError(message: string) {
    this.loadError = message;
    this.isLoading = false;
    console.error(message);
  }

  getBrandName(brandId: number | null): string {
    if (!brandId) return 'None';
    const brand = this.brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown';
  }

  getTypeName(typeId: number | null): string {
    if (!typeId) return 'None';
    const type = this.types.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  }

  getEmptyProduct(): Product {
    return {
      id: 0,
      name: '',
      description: '',
      price: 0,
      img: '',
      productBrandId: null as any,
      productTypeId: null as any,
      productBrand: '',
      productType: '',
      quantity: 0
    };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentProduct.img = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  showAddProductForm() {
    if (this.brands.length === 0 || this.types.length === 0) {
      alert('Required data not loaded yet. Please try again.');
      return;
    }
    
    this.editingProduct = false;
    this.currentProduct = this.getEmptyProduct();
    this.selectedFile = null;
    this.showForm = true;
  }

  editProduct(product: Product) {
    this.editingProduct = true;
    this.currentProduct = { ...product };
    this.selectedFile = null;
    this.showForm = true;
  }

  cancelEdit() {
    this.showForm = false;
    this.currentProduct = this.getEmptyProduct();
    this.selectedFile = null;
  }

  saveProduct() {
    if (!this.currentProduct.productBrandId || !this.currentProduct.productTypeId) {
      alert('Please select both a brand and a type');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token not found');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('name', this.currentProduct.name);
    formData.append('description', this.currentProduct.description);
    formData.append('price', this.currentProduct.price.toString());
    formData.append('productBrandId', this.currentProduct.productBrandId.toString());
    formData.append('productTypeId', this.currentProduct.productTypeId.toString());
    formData.append('quantity', this.currentProduct.quantity.toString());
    
    if (this.selectedFile) {
      formData.append('PictureUrl', this.selectedFile);
    }

    if (this.editingProduct) {
      formData.append('id', this.currentProduct.id.toString());
    }

    const request = this.editingProduct
      ? this.http.put(`${this.baseUrl}/Product/${this.currentProduct.id}`, formData, { headers })
      : this.http.post(`${this.baseUrl}/Product`, formData, { headers });

    request.subscribe({
      next: () => {
        this.loadInitialData();
        this.showForm = false;
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Error saving product:', error);
        alert(`Failed to save product: ${error.error?.message || error.message}`);
      }
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token not found');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`${this.baseUrl}/Product/${id}`, { headers }).subscribe({
      next: () => {
        this.loadInitialData();
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    });
  }
}