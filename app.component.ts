import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { ApiService } from './api.service';
import { NotificacionesService } from './servicios/notificaciones.service';


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

  notificaciones_array = [];

  notificaciones_cantidad = this.notificaciones_array.length;

  constructor(private apiService: ApiService, private notificaciones: NotificacionesService)
  {
    
  }

  ngOnInit(): void
  {

    // Conectarse al servidor de notificaciones al iniciar el componente
    this.notificaciones.listen('notificacion').subscribe((notificacion: any) =>
    {
      console.log(`Mensaje recibido: ${notificacion.notificacion}`);
      console.log(notificacion);

      this.obtenerNotificaciones();

      // alert(notificacion.notificacion);
      
      
    });

    // this.apiService.obtener_notificaciones$.subscribe(() => {
    //   this.cargarDatos();
    // });

    this.obtenerNotificaciones();
    
  }

  ngOnDestroy()
  {
    this.notificaciones.disconnect();
  }

  abrir_cerrar_notificaciones()
  {
    this.notificaciones_abierto = !this.notificaciones_abierto;
  }

  obtenerNotificaciones()
  {
    this.apiService.obtener_notificaciones().subscribe({
      next: (data: any) =>
      {
        this.notificaciones_array = data;
        this.notificaciones_cantidad = data.length;

        console.log(this.notificaciones_array);
        
      },
      error: (err) =>
      {
        console.error('Error al obtener los recorridos:', err);
      }
    });
  }


  
}