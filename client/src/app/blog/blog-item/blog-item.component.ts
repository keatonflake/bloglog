import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-item',
  templateUrl: './blog-item.component.html',
  imports: [CommonModule]
})
export class BlogItemComponent {
  @Input() title = 'My Blog Post With a SUper Long Title';
  @Input() tags = ['Microsoft', 'World Peace', 'Tag3'];
}
