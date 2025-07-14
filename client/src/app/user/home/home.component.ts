import { Component } from '@angular/core';
import { BlogListComponent } from "../../blog/blog-list/blog-list.component";
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service'

@Component({
  selector: 'app-home',
  imports: [BlogListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router, private authService: AuthService) { }
  onLogout() {
    this.authService.logout()
    this.router.navigate(['/login'])
  }

  onAddNew() {
    this.router.navigate(['/add-edit/blog'])
  }
}
