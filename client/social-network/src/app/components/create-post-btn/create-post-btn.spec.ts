import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePostBtn } from './create-post-btn';

describe('CreatePostBtn', () => {
  let component: CreatePostBtn;
  let fixture: ComponentFixture<CreatePostBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePostBtn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePostBtn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
