import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { ApiService } from './api.service';
import { NotificacionesService } from './servicios/notificaciones.service';

export interface Notificacion {
  id: number;
  mensaje: string;
  tipo: 'danger' | 'warning' | 'info' | 'success';
  fecha: string;
  visto: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Proyecto'; 
  
  notificaciones_abierto = false;
  notificaciones: Notificacion[] = [];
  notificaciones_no_leidas = 0;

  constructor(
    private apiService: ApiService, 
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {
    // Conectarse al servidor de notificaciones
    this.notificacionesService.listen('notificacion').subscribe((nuevaNotificacion: any) => {
      this.obtenerNotificaciones();
    });

    this.obtenerNotificaciones();
  }

  ngOnDestroy(): void {
    this.notificacionesService.disconnect();
  }

  abrir_cerrar_notificaciones(): void {
    this.notificaciones_abierto = !this.notificaciones_abierto;
    
    // Si se abren las notificaciones, marcar todas como leídas
    if (this.notificaciones_abierto && this.notificaciones_no_leidas > 0) {
      this.marcarTodasComoLeidas();
    }
  }

  obtenerNotificaciones(): void {
    this.apiService.obtener_notificaciones().subscribe({
      next: (data: any) => {
        this.notificaciones = data.map((n: any) => ({
          ...n,
          fecha: n.fecha || new Date().toISOString(),
          visto: n.visto || false
        }));

        this.notificaciones = this.notificaciones.reverse();
        
        this.actualizarContadorNoLeidas();
      },
      error: (err) => {
        console.error('Error al obtener notificaciones:', err);
      }
    });
  }

  marcarComoLeida(id: number): void {
    const notificacion = this.notificaciones.find(n => n.id === id);
    if (notificacion && !notificacion.visto) {
      // Actualizar localmente
      notificacion.visto = true;
      this.actualizarContadorNoLeidas();
      
      // Enviar al backend
      this.apiService.marcar_notificacion_leida(id).subscribe({
        error: (err) => console.error('Error al marcar como leída:', err)
      });
    }
  }

  marcarTodasComoLeidas(): void {
    const noLeidas = this.notificaciones.filter(n => !n.visto);
    
    if (noLeidas.length > 0) {
      // Actualizar localmente
      this.notificaciones.forEach(n => n.visto = true);
      this.notificaciones_no_leidas = 0;
      
      // Enviar al backend
      this.apiService.marcar_todas_leidas().subscribe({
        error: (err) => console.error('Error al marcar todas como leídas:', err)
      });
    }
  }

  private actualizarContadorNoLeidas(): void {
    this.notificaciones_no_leidas = this.notificaciones.filter(n => !n.visto).length;
  }
}