import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComprasService } from '../servicios/compras.services';
import { NotificacionesService } from '../servicios/notificaciones.service';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css']
})
export class ComprasComponent implements OnInit {
  compras: any[] = [];
  proveedores: any[] = [];
  nuevaCompra: any = {
    proveedor_id: '',
    producto: '',
    cantidad: 1,
    precio_unitario: 0,
    fecha_compra: new Date().toISOString().split('T')[0],
    estado: 'pendiente'
  };
  estados = ['pendiente', 'completada', 'cancelada'];
  filtro = '';

  constructor(
    private comprasService: ComprasService,
    private notificationService: NotificacionesService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.cargarCompras();
    this.cargarProveedores();
    // this.configurarSocket();
  }

  // configurarSocket(): void {
  //   this.apiService.socket?.on('notificacion', (data: any) => {
  //     if (data.tipo === 'Nueva compra') {
  //       this.notificationService.showInfo(data.mensaje);
  //       this.cargarCompras();
  //     }
  //   });
  // }

  cargarCompras(): void {
    this.comprasService.getCompras().subscribe({
      next: (data) => this.compras = data,
      error: (error) => console.log("Error al cargar comprar")
       // this.notificationService.showError('Error al cargar compras')
    });
  }

  cargarProveedores(): void {
    this.comprasService.getProveedores().subscribe({
      next: (data) => this.proveedores = data,
      error: (error) => console.log("Error al cargar proveedores")
       // this.notificationService.showError('Error al cargar proveedores')
    });
  }

  crearCompra(): void {
    this.comprasService.crearCompra(this.nuevaCompra).subscribe({
      next: () => {
        this.cargarCompras();
        // this.notificationService.showSuccess('Compra creada exitosamente');
        this.resetearFormulario();
      },
      error: (error) => { console.log("Error al cargar comprar");
        // this.notificationService.showError('Error al crear compra')
      }
    });
  }

  resetearFormulario(): void {
    this.nuevaCompra = {
      proveedor_id: '',
      producto: '',
      cantidad: 1,
      precio_unitario: 0,
      fecha_compra: new Date().toISOString().split('T')[0],
      estado: 'pendiente'
    };
  }

  actualizarEstado(id: number, estado: string): void {
    this.comprasService.actualizarCompra(id, estado).subscribe({
      next: () => {
        this.cargarCompras();
        // this.notificationService.showSuccess('Estado de compra actualizado');
      },
      error: (error) =>  console.log("Error al actualizar compra")
        // this.notificationService.showError('Error al actualizar compra')
    });
  }

  eliminarCompra(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta compra?')) {
      this.comprasService.eliminarCompra(id).subscribe({
        next: () => {
          this.cargarCompras();
          // this.notificationService.showSuccess('Compra eliminada exitosamente');
        },
        error: (error) =>  console.log("Error al eliminar la compra")
          // this.notificationService.showError('Error al eliminar compra')
      });
    }
  }

  get comprasFiltradas(): any[] {
    return this.compras.filter(compra => 
      compra.producto.toLowerCase().includes(this.filtro.toLowerCase()) ||
      (compra.nombre_proveedor && compra.nombre_proveedor.toLowerCase().includes(this.filtro.toLowerCase())) ||
      compra.estado.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }
}