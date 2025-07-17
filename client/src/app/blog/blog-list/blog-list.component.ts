import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogItemComponent } from '../blog-item/blog-item.component';
import { HttpClient } from '@angular/common/http';
import { Blog } from '../Blog.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, BlogItemComponent],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {
  blogs: any = []

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get('http://localhost:3000/api/blog').subscribe({
      next: (response) => {
        this.blogs = response
        console.log(response)
      },
      error: (error) => {
        console.log("Error fetching blogs: ", error)
      }
    })
  }
}
