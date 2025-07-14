import { Routes } from '@angular/router';
import { HomeComponent } from './user/home/home.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { BlogComponent } from './blog/blog/blog.component';
import { BlogAddEdit } from './blog/blog-add-edit/blog-add-edit.component'


export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: '', component: HomeComponent,
        canActivate: [AuthGuard]
    },
    { path: 'blog:id', component: BlogComponent },
    { path: 'add-edit/blog', component: BlogAddEdit },
    { path: 'blog:id', component: BlogComponent },
];
