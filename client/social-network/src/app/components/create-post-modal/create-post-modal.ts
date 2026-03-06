import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-post-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-post-modal.html',
  styleUrl: './create-post-modal.css',
})
export class CreatePostModal {
  title = '';
  description = '';

  @Output() closeModal = new EventEmitter<void>();
  @Output() submitPost = new EventEmitter<{ title: string; description: string }>();

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  close() {
    this.closeModal.emit();
  }

  submit() {
    const cleanTitle = this.title.trim();
    const cleanDescription = this.description.trim();

    if (!cleanTitle || !cleanDescription) {
      return;
    }

    this.submitPost.emit({
      title: cleanTitle,
      description: cleanDescription,
    });
  }
}
