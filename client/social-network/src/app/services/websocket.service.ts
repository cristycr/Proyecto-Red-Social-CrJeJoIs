import { inject, Injectable } from '@angular/core';
import { ToastService } from './toast';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket?: WebSocket;
  private toast = inject(ToastService);

  connect(jwt: string) {
    const isHttps = location.protocol === 'https:';
    const protocol = isHttps ? 'wss' : 'ws';
    const host = location.hostname;
    const port = isHttps ? 7185 : 5195;
    const wsUrl = `${protocol}://${host}:${port}/ws?access_token=${jwt}`;

    console.log('Intentando conectar WS a', wsUrl);

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket conectado:', this.socket?.url);
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "new_follower") {
          const { nickname, avatar } = message.payload;
          this.toast.showInfo(`${nickname} ha empezado a seguirte`, avatar);
        }

        if (message.type === "lost_follower") {
          const { nickname, avatar } = message.payload;
          this.toast.showInfo(`${nickname} ha dejado de seguirte`, avatar);
        }
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket cerrado', event.reason);
      this.socket = undefined;
    };

    this.socket.onerror = (err) => {
      console.error('WebSocket error', err);
    };
  }

  disconnect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.socket = undefined;
  }
}