import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { ToastService } from './services/toast';
import { AppSiteHeader } from './components/app-site-header/app-site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref, AppSiteHeader],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly toastService = inject(ToastService);

  protected readonly title = signal('social-network');
  protected readonly toasts = this.toastService.toasts;

  protected dismissToast(id: number): void {
    this.toastService.dismiss(id);
  }
}