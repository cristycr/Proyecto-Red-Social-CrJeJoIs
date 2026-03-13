import { computed, Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextToastId = 1;
  private readonly _toasts = signal<ToastMessage[]>([]);

  readonly toasts = computed(() => this._toasts());

  showSuccess(message: string, durationMs: number = 3200): void {
    this.show('success', message, durationMs);
  }

  showError(message: string, durationMs: number = 4000): void {
    this.show('error', message, durationMs);
  }

  showInfo(message: string, durationMs: number = 3200): void {
    this.show('info', message, durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }

  private show(type: ToastType, message: string, durationMs: number): void {
    const id = this.nextToastId++;

    this._toasts.update((currentToasts) => [
      ...currentToasts,
      {
        id,
        type,
        message,
      },
    ]);

    window.setTimeout(() => {
      this.dismiss(id);
    }, durationMs);
  }
}