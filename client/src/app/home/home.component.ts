import { Component, OnInit } from '@angular/core';
import { BlogListComponent } from "../blog/blog-list/blog-list.component";
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [BlogListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  user: any = {}

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadUser()
  }

  loadUser() {
    this.http.get('http://localhost:3000/api/user/profile')
      .subscribe({
        next: (response: any) => {
          this.user = response
        },
        error: (error) => {
          console.error('Error:', error)
        }
      })
  }

  onLogout() {
    this.authService.logout()
    this.router.navigate(['/login'])
  }

  onAddNew() {
    this.router.navigate(['/add-edit/blog'])
  }

}
