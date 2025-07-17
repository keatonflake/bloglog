import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-blog-item',
  templateUrl: './blog-item.component.html',
  imports: [CommonModule, RouterLink]
})
export class BlogItemComponent {
  @Input() blog: any;

  constructor(private router: Router) { }
}