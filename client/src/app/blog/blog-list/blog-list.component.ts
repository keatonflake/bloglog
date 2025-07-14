import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogItemComponent } from '../blog-item/blog-item.component';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, BlogItemComponent],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent {
  blogs = [{ title: 'title' }, { title: 'title' }, { title: 'title' }, { title: 'title' }, { title: 'title' }, { title: 'title' },]
}
