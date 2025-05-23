import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="jumbotron text-center">
        <h1>Welcome to Our E-Commerce Store</h1>
        <p class="lead">Discover amazing products at great prices</p>
        <a routerLink="/products" class="btn btn-primary btn-lg">Shop Now</a>
      </div>

      <div class="row mt-4">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Wide Selection</h5>
              <p class="card-text">Browse through our extensive collection of products.</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Great Prices</h5>
              <p class="card-text">Find the best deals and discounts.</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Fast Delivery</h5>
              <p class="card-text">Quick and reliable shipping to your doorstep.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .jumbotron {
      padding: 4rem 2rem;
      background-color: #f8f9fa;
      border-radius: .3rem;
      margin-bottom: 2rem;
    }
  `]
})
export class HomeComponent {} 