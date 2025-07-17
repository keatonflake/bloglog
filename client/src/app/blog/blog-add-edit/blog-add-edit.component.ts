import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

interface BlogData {
  title: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
}

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
  selector: 'app-blog-add-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, QuillModule],
  templateUrl: './blog-add-edit.component.html',
  styles: [`
    .quill-editor {
      height: 50vh;
      min-height: 300px;
    }
  `]
})
export class BlogAddEdit implements OnInit, OnDestroy {

  isEditMode: boolean = false;
  blogId: string = '';
  isLoading: boolean = false;

  blogTitle: string = '';
  blogContent: string = '';
  blogTags: string = '';
  blogStatus: 'draft' | 'published' | 'archived' = 'draft';

  isSaving: boolean = false;
  savedContent: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  quillConfig = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Check if we have a blog ID in the route (edit mode)
    this.blogId = this.route.snapshot.paramMap.get('id') || '';
    this.isEditMode = !!this.blogId;

    if (this.isEditMode) {
      this.loadBlogForEdit();
    }

    // Subscribe to route changes for dynamic navigation
    this.route.paramMap.subscribe(params => {
      const newBlogId = params.get('id') || '';
      if (newBlogId !== this.blogId) {
        this.blogId = newBlogId;
        this.isEditMode = !!this.blogId;

        if (this.isEditMode) {
          this.loadBlogForEdit();
        } else {
          this.resetForm();
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup is handled by ngx-quill
  }

  private loadBlogForEdit(): void {
    this.isLoading = true;
    this.clearMessages();

    this.http.get<BlogResponse>(`http://localhost:3000/api/blog/${this.blogId}`)
      .subscribe({
        next: (response: BlogResponse) => {
          this.blogTitle = response.title;
          this.blogContent = response.content;
          this.blogTags = response.tags ? response.tags.join(', ') : '';
          this.blogStatus = response.status;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading blog:', error);
          this.handleApiError(error, 'Failed to load blog for editing');
          this.isLoading = false;

          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        }
      });
  }

  private validateForm(): boolean {
    this.clearMessages();

    if (!this.blogTitle.trim()) {
      this.errorMessage = 'Please enter a blog title';
      return false;
    }

    if (this.blogTitle.length > 200) {
      this.errorMessage = 'Title must be less than 200 characters';
      return false;
    }

    if (!this.blogContent || this.blogContent.trim() === '<p><br></p>' || this.blogContent.trim() === '') {
      this.errorMessage = 'Please enter some content';
      return false;
    }

    return true;
  }

  private processTagsInput(): string[] {
    if (!this.blogTags.trim()) return [];

    return this.blogTags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .slice(0, 10);
  }

  private resetForm(): void {
    this.blogTitle = '';
    this.blogContent = '';
    this.blogTags = '';
    this.blogStatus = 'draft';
    this.savedContent = '';
    this.clearMessages();
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private handleApiError(error: any, defaultMessage: string): void {
    if (error.status === 401) {
      this.errorMessage = 'You are not authorized. Please log in again.';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } else if (error.status === 403) {
      this.errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      this.errorMessage = 'Blog not found.';
    } else {
      this.errorMessage = error.error?.error || defaultMessage;
    }
  }

  // Event handlers
  onContentChanged(event: any): void {
    this.clearMessages();
  }

  saveBlog(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;
    this.clearMessages();

    const blogData: BlogData = {
      title: this.blogTitle.trim(),
      content: this.blogContent,
      tags: this.processTagsInput(),
      status: this.blogStatus
    };

    if (this.isEditMode) {
      this.updateBlog(blogData);
    } else {
      this.createBlog(blogData);
    }
  }

  private createBlog(blogData: BlogData): void {
    this.http.post('http://localhost:3000/api/blog', blogData)
      .subscribe({
        next: (response: any) => {
          this.handleSaveSuccess('Blog created successfully!', response);
        },
        error: (error: any) => {
          this.handleSaveError(error, 'create');
        }
      });
  }

  private updateBlog(blogData: BlogData): void {
    this.http.put(`http://localhost:3000/api/blog/${this.blogId}`, blogData)
      .subscribe({
        next: (response: any) => {
          this.handleSaveSuccess('Blog updated successfully!', response);
        },
        error: (error: any) => {
          this.handleSaveError(error, 'update');
        }
      });
  }

  deleteBlog(): void {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    this.isSaving = true;
    this.clearMessages();

    this.http.delete(`http://localhost:3000/api/blog/${this.blogId}`)
      .subscribe({
        next: (response: any) => {
          this.handleDeleteSuccess('Blog deleted successfully!', response);
        },
        error: (error: any) => {
          this.handleDeleteError(error);
        }
      });
  }

  private handleSaveSuccess(message: string, response: any): void {
    this.successMessage = message;
    this.savedContent = this.blogContent;
    this.isSaving = false;

    console.log('Blog saved:', response);

    setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);
  }
  private handleDeleteSuccess(message: string, response: any): void {
    this.successMessage = message;
    this.isSaving = false;

    console.log('Blog deleted:', response);

    this.router.navigate(['/']);
  }

  private handleDeleteError(error: any): void {
    console.error('Error deleting blog:', error);
    this.isSaving = false;

    this.handleApiError(error, 'Failed to delete blog. Please try again.');
  }

  private handleSaveError(error: any, action: string): void {
    console.error('Error saving blog:', error);
    this.handleApiError(error, `Failed to ${action} blog. Please try again.`);
    this.isSaving = false;
  }

  saveDraft(): void {
    this.blogStatus = 'draft';
    this.saveBlog();
  }

  publishBlog(): void {
    this.blogStatus = 'published';
    this.saveBlog();
  }

  clearContent(): void {
    if (confirm('Are you sure you want to clear all content? This action cannot be undone.')) {
      this.resetForm();
    }
  }

  previewContent(): void {
    this.savedContent = this.blogContent;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit Blog Post' : 'Create A New Blog';
  }

  getActionButtonText(action: string): string {
    if (this.isSaving) {
      return this.isEditMode
        ? `Updating...`
        : `${action === 'publish' ? 'Publishing' : 'Saving'}...`;
    }

    return this.isEditMode
      ? `Update ${action === 'publish' ? 'and Publish' : 'Blog'}`
      : `${action === 'publish' ? 'Publish' : 'Save as Draft'} Blog`;
  }

  get isFormDirty(): boolean {
    return !!(this.blogTitle || this.blogContent || this.blogTags);
  }
}