import { Injectable } from '@angular/core';

import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private socket: Socket;

  constructor()
  {
    // Indicar la dirección del servidor de notificaciones
    this.socket = io('http://localhost:3000');
  }


   // Escuchar notificaciones del servidor
   listen(eventName: string): Observable<any> {

    return new Observable((subscriber) =>
    {
      this.socket.on(eventName, (data) =>
      {
        subscriber.next(data);
      });

      // Manejar la desconexión
      return () =>
      {
        this.socket.off(eventName);
      };
    });
  }


  // Enviar datos al servidor
  emit(eventName: string, data: any): void
  {
    this.socket.emit(eventName, data);
  }

  // Desconectarse del servidor de notificaciones
  disconnect(): void
  {
    this.socket.disconnect();
  }

}
