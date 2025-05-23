import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService, RegisterDto } from '../../services/account.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errors: string[] = [];

  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router) {
    this.registerForm = this.fb.group({
      dispalyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.errors = [];
    
      const model: RegisterDto = {
        dispalyName: this.registerForm.get('dispalyName')?.value || '',
        email: this.registerForm.get('email')?.value || '',
        phoneNumber: this.registerForm.get('phoneNumber')?.value || '',
        password: this.registerForm.get('password')?.value || '',
        confirmPassword: this.registerForm.get('confirmPassword')?.value || '',
        role: "User"
      };

      console.log('Sending registration data:', model);

      this.accountService.register(model).subscribe({
        next: (user) => {
          console.log('Registered user:', user);
          alert('Registration Successful!');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Registration error:', err);
          if (err.error.errors) {
            if (Array.isArray(err.error.errors)) {
              this.errors = err.error.errors.map((error: unknown) => String(error));
            } else {
              // If errors is an object, convert it to array of messages
              this.errors = Object.values(err.error.errors).flat().map((error: unknown) => String(error));
            }
          } else if (err.error) {
            this.errors = [typeof err.error === 'string' ? err.error : 'Registration failed'];
          } else {
            this.errors = ['Registration failed'];
          }
        }
      });
    } else {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
