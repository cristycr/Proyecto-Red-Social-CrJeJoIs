import { inject, Injectable } from '@angular/core';
import { ToastService } from './toast';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket?: WebSocket;
  private jwt?: string;
  private shouldReconnect = true;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000; // 30s
  private toast = inject(ToastService);

  constructor() {
    window.addEventListener("online", () => {
      console.log("Internet restaurado");
      if (this.shouldReconnect && this.jwt && !this.socket) {
        this.connect(this.jwt);
      }
    });

    window.addEventListener("offline", () => {
      console.log("Sin conexión a internet");
    });
  }

  /** Calcula delay de reconexión con backoff exponencial + jitter */
  private getReconnectDelay() {
    const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    const jitter = Math.random() * 1000;
    return baseDelay + jitter;
  }

  /** Intento de reconexión seguro */
  private attemptReconnect() {
    if (this.shouldReconnect && this.jwt && localStorage.getItem("jwt") === this.jwt) {
      const delay = this.getReconnectDelay();
      console.log(`Reintentando conexión WS en ${Math.round(delay)}ms`);
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(this.jwt!);
      }, delay);
    } else {
      console.log("No hay JWT válido: no se reconecta");
    }
  }

  /** Función que ejecuta al cerrar el socket */
  private socketOnClose = () => {
    console.log("WebSocket cerrado");
    this.socket = undefined;
    this.attemptReconnect();
  }

  /** Conecta WS */
  connect(jwt: string) {
    this.jwt = jwt;
    this.shouldReconnect = true;

    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) return;

    if (this.socket) {
      try {
        this.socket.close();
      } catch { }
      this.socket = undefined;
    }

    const wsUrl = `wss://${location.hostname}:7185/ws?access_token=${jwt}`;

    console.log('Intentando conectar WS a', wsUrl);

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket conectado:', this.socket?.url);
      this.reconnectAttempts = 0;
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

    this.socket.onclose = this.socketOnClose;

    this.socket.onerror = (err) => {
      console.error('WebSocket error', err);
    };
  }

  /** Cierra WS y evita reconexiones automáticas */
  disconnect() {
    this.shouldReconnect = false;

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }

    this.socket = undefined;
  }
}