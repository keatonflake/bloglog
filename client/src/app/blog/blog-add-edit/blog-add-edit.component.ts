// quill-editor.component.ts
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var Quill: any;

@Component({
  selector: 'app-blog-add-edit',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-add-edit.component.html',

})
export class BlogAddEdit implements OnInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

  private quill: any;
  savedContent: string = '';
  isSaving: boolean = false;

  ngOnInit() {
    this.loadQuillAndInitialize();
  }

  ngOnDestroy() {
    if (this.quill) {
      this.quill = null;
    }
  }

  private loadQuillAndInitialize() {
    // Check if Quill is already loaded
    if (typeof Quill !== 'undefined') {
      this.initializeQuill();
      return;
    }

    // Load Quill CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css';
    document.head.appendChild(link);

    // Load Quill JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js';
    script.onload = () => {
      this.initializeQuill();
    };
    document.head.appendChild(script);
  }

  private initializeQuill() {
    const toolbarOptions = [
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
    ];

    this.quill = new Quill(this.editorContainer.nativeElement, {
      theme: 'snow',
      modules: {
        toolbar: toolbarOptions
      },
      placeholder: 'Start writing your content here...'
    });

    // Optional: Listen to content changes
    this.quill.on('text-change', () => {
      console.log('Content changed');
    });
  }

  saveContent() {
    if (!this.quill) return;

    this.isSaving = true;

    // Get the HTML content
    const htmlContent = this.quill.root.innerHTML;

    // Simulate saving (replace with actual save logic)
    setTimeout(() => {
      this.savedContent = htmlContent;
      this.isSaving = false;

      // Here you would typically send the content to your backend
      console.log('Content saved:', htmlContent);

      // You can also get plain text if needed:
      const plainText = this.quill.getText();
      console.log('Plain text:', plainText);

      // Or get Delta format (Quill's internal format):
      const delta = this.quill.getContents();
      console.log('Delta format:', delta);

      alert('Content saved successfully!');
    }, 1000);
  }

  clearContent() {
    if (!this.quill) return;

    this.quill.setText('');
  }

  loadSavedContent() {
    if (!this.quill || !this.savedContent) return;

    this.quill.root.innerHTML = this.savedContent;
  }
}