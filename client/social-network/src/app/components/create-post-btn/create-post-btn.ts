import { Component, signal } from '@angular/core';
import { CreatePostModal } from '../create-post-modal/create-post-modal';

@Component({
  selector: 'app-create-post-btn',
  standalone: true,
  imports: [CreatePostModal],
  templateUrl: './create-post-btn.html',
  styleUrl: './create-post-btn.css',
})
export class CreatePostBtn {
  protected readonly isModalOpen = signal(false);

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onSubmitPost(postData: { title: string; description: string }) {
    console.log('Nueva publicación:', postData);
    this.closeModal();
  }
}
