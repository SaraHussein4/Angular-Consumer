import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return true;
}; 