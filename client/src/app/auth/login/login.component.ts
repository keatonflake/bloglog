import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup
  errorMessage: string | null = null
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      'email': ['', [Validators.required, Validators.email]],
      'password': ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  onSubmit(): void {
    this.isLoading = true
    this.errorMessage = null

    if (this.loginForm.valid) {
      const formData = this.loginForm.value

      this.http.post('http://localhost:3000/api/auth/login', formData).subscribe({
        next: (response: any) => {
          console.log('Success: ', response)
          this.isLoading = false

          if (response.success && response.token) {
            this.authService.login(response.token)
            this.router.navigate(['/'])
          } else {
            this.errorMessage = response.message || 'Login failed'
          }
        },
        error: (error) => {
          console.log('Error: ', error)
          this.isLoading = false

          if (error.status === 401) {
            this.errorMessage = 'Invalid email or password'
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please try again.'
          } else {
            this.errorMessage = error.error?.message || 'An error occurred during login'
          }
        }
      })
    } else {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched()
    }
  }
  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName)
    return !!(field && field.invalid && field.touched)
  }

  // Helper method to get specific field error
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName)
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`
      if (field.errors['email']) return 'Please enter a valid email'
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`
    }
    return ''
  }
}