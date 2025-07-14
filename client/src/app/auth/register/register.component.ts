import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  imports: [ReactiveFormsModule, RouterModule],
})
export class RegisterComponent {
  registrationForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.registrationForm = this.fb.group({
      'username': ['', [Validators.required, Validators.minLength(3)]],
      'email': ['', [Validators.required, Validators.email]],
      'password': ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      const formData = this.registrationForm.value

      this.http.post('http://localhost:3000/api/auth/register', formData).subscribe({
        next: (response: any) => {
          console.log('Success: ', response)

          if (response.token) {
            this.authService.login(response.token);
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.log('Error: ', error)
        }
      }
      )
    }
  }
}
