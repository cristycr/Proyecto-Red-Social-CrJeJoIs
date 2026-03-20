import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { ToastService } from './services/toast';
import { SocketService } from './services/websocket.service';
import { AppSiteHeader } from './components/app-site-header/app-site-header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLinkWithHref, AppSiteHeader],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit, OnDestroy {

  private readonly toastService = inject(ToastService);
  private readonly socketService = inject(SocketService);

  protected readonly title = signal('social-network');
  protected readonly toasts = this.toastService.toasts;

  protected dismissToast(id: number): void {
    this.toastService.dismiss(id);
  }

  ngOnInit(): void {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      this.socketService.connect(jwt);
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}