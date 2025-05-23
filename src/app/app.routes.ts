import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { authGuard } from './guards/auth.guard';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { RegisterComponent } from './account/register/register.component';
import { ProductsComponent } from './products/products.component';
import { LoginComponent } from './login/login.component';
import { CartComponent } from './cart/cart.component';

// Admin Guard function
const adminGuard = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  
  // Here you can add additional admin role verification
  // For now, we'll just check if the user is logged in
  return true;
};

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'account/register',
        component: RegisterComponent
    },
    {
        path: 'products',
        loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent)
    },
    {
        path: 'cart',
        loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent),
        canActivate: [authGuard]
    },
    {
        path: 'orders',
        loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent),
        canActivate: [authGuard]
    },
    {
        path: 'admin/dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [adminGuard]
    },
    { path: '', redirectTo: '/products', pathMatch: 'full' },  
    { path: '**', redirectTo: '/products' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}