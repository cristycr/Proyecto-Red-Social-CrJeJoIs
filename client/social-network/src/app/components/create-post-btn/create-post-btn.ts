import { Component, inject, signal } from '@angular/core';
import { CreatePostModal } from '../create-post-modal/create-post-modal';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { AddPostDto } from '../../models/add-post-dto';

@Component({
  selector: 'app-create-post-btn',
  standalone: true,
  imports: [CreatePostModal],
  templateUrl: './create-post-btn.html',
  styleUrl: './create-post-btn.css',
})
export class CreatePostBtn {
  protected readonly isModalOpen = signal(false);
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  async onSubmitPost(postData: { title: string; description: string }) {
    const userId = this.authService.currentUserId();

    if (!userId) {
      alert('Debes iniciar sesión para publicar.');
      return;
    }

    const dto: AddPostDto = {
      userId,
      title: postData.title,
      description: postData.description,
    };

    try {
      await this.apiService.post<AddPostDto>('posts', dto);
      this.closeModal();
    } catch (err: any) {
      alert(err?.error?.error ?? 'No se pudo crear la publicación.');
    }
  }
}