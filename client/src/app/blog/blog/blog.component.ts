import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface BlogResponse {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  blog: BlogResponse | null = null;
  blogId: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  shareMessage = ''

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.blogId = this.route.snapshot.paramMap.get('id') || '';

    if (this.blogId) {
      this.loadBlog();
    } else {
      this.errorMessage = 'No blog ID provided';
    }
  }

  loadBlog(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<BlogResponse>(`http://localhost:3000/api/blog/${this.blogId}`)
      .subscribe({
        next: (response: BlogResponse) => {
          this.blog = response;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading blog:', error);
          this.isLoading = false;
          this.handleError(error);
        }
      });
  }

  private handleError(error: any): void {
    switch (error.status) {
      case 401:
        this.errorMessage = 'You need to login to view this blog.';
        break;
      case 403:
        this.errorMessage = 'You do not have permission to view this blog.';
        break;
      case 404:
        this.errorMessage = 'Blog not found.';
        break;
      case 0:
        this.errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        break;
      default:
        this.errorMessage = error.error?.error || 'An unexpected error occurred while loading the blog.';
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  retryLoad(): void {
    this.loadBlog();
  }

  get isPublished(): boolean {
    return this.blog?.status === 'published';
  }

  // get canEdit(): boolean {
  //   return !!this.blog;
  // }

  get formattedDate(): string {
    if (!this.blog?.createdAt) return '';
    return new Date(this.blog.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get formattedUpdatedDate(): string {
    if (!this.blog?.updatedAt) return '';
    return new Date(this.blog.updatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  shareLink() {
    const shareUrl = `${window.location.origin}/blog/${this.blog?._id}`
    navigator.clipboard.writeText(shareUrl)
    this.shareMessage = 'Link Copied!'
    setTimeout(() => this.shareMessage = '', 2000)
  }
}