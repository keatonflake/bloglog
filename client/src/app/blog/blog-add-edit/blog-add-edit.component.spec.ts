import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogAddEditComponent } from './blog-add-edit.component';

describe('BlogAddEditComponent', () => {
  let component: BlogAddEditComponent;
  let fixture: ComponentFixture<BlogAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
