// notificaciones.component.ts
import { Component } from '@angular/core';
import { NotificacionesService } from './notificaciones.service';

@Component({
  selector: 'app-notificaciones',
  template: `
    <div *ngIf="mensaje" class="alert alert-{{tipo}} fixed-top m-3">
      {{ mensaje }}
    </div>
  `,
  styles: [`
    .fixed-top {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }
  `]
})
export class NotificacionesComponent {
  mensaje: string | null = null;
  tipo: string = 'info';

  constructor(private notificaciones: NotificacionesService) {
    this.notificaciones.listen('notificacion').subscribe((data: any) => {
      this.mensaje = data.mensaje;
      this.tipo = data.tipo;
      setTimeout(() => this.mensaje = null, 3000);
    });
  }
}