import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const adminGuard = () => {
  const router = inject(Router);

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token || role !== 'admin') {
    router.navigate(['/login']);
    return false;
  }

  return true;
}; 