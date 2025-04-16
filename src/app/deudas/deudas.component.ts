import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DeudasService } from '../servicios/deudas.services';
import { NotificacionesService } from '../servicios/notificaciones.service';
import { ApiService } from '../api.service';
import * as bootstrap from 'bootstrap'; // Importación para los modales

@Component({
  selector: 'app-deudas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './deudas.component.html',
  styleUrls: ['./deudas.component.css']
})
export class DeudasComponent implements OnInit {
  deudas: any[] = [];
  clientes: any[] = [];
  tiposGarrafon = ['Bonafont', 'Azul', 'Varios', 'Otro'];
  nuevaDeuda: any = {
    recorrido_id: '',
    fecha_venta: new Date().toISOString().split('T')[0],
    cantidad_garrafones: 1,
    tipo_garrafon: 'Bonafont',
    monto_total: 0,
    fecha_vencimiento: this.calcularFechaVencimiento(7),
    metodo_pago: 'efectivo',
    notas: ''
  };
  metodosPago = ['efectivo', 'transferencia', 'tarjeta', 'pendiente'];
  filtro = '';
  
  // Nuevas propiedades para el paginado y modal
  registrosMostrar: number = 10;
  opcionesRegistros: number[] = [5, 10, 25, 50, 100];
  deudaSeleccionada: any = null;
  nuevoPago: any = {
    monto: 0,
    metodo_pago: 'efectivo',
    notas: ''
  };

  constructor(
    private deudasService: DeudasService,
    private notificationService: NotificacionesService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.cargarDeudas();
    this.cargarClientes();
  }

  cargarDeudas(): void {
    this.deudasService.getDeudas().subscribe({
      next: (data) => this.deudas = data,
      error: (error) => {
        console.log("Error al cargar deudas", error);
       
      }
    });
  }

  cargarClientes(): void {
    this.apiService.getRecorridos().subscribe({
      next: (data) => this.clientes = data,
      error: (error) => {
        console.log("Error al cargar clientes", error);
       
      }
    });
  }

  calcularFechaVencimiento(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
  }

  select_cliente_cambiado(valor: string): void {
    this.nuevaDeuda.recorrido_id = valor;
  }

  select_tipo_garrafon_cambiado(valor: string): void {
    this.nuevaDeuda.tipo_garrafon = valor;
    this.calcularMontoTotal();
  }

  input_cantidad_cambiado(valor: number): void {
    this.nuevaDeuda.cantidad_garrafones = valor;
    this.calcularMontoTotal();
  }

  calcularMontoTotal(): void {
    const precioUnitario = this.obtenerPrecioPorTipo(this.nuevaDeuda.tipo_garrafon);
    this.nuevaDeuda.monto_total = this.nuevaDeuda.cantidad_garrafones * precioUnitario;
  }

  obtenerPrecioPorTipo(tipo: string): number {
    const precios: {[key: string]: number} = {
      'Bonafont': 20,
      'Azul': 20,
      'Varios': 18,
      'Otro': 15
    };
    return precios[tipo] || 15;
  }

  input_fecha_vencimiento_cambiado(valor: string): void {
    this.nuevaDeuda.fecha_vencimiento = valor;
  }

  select_metodo_pago_cambiado(valor: string): void {
    this.nuevaDeuda.metodo_pago = valor;
  }

  input_notas_cambiado(valor: string): void {
    this.nuevaDeuda.notas = valor;
  }

  crearDeuda(): void {
    console.log("Nueva deuda", this.nuevaDeuda);
    
    this.deudasService.crearDeuda(this.nuevaDeuda).subscribe({
      next: () => {
        this.cargarDeudas();
        this.resetearFormulario();
      
      },
      error: (error) => {
        console.log("Error al crear deuda", error);
      
      }
    });
  }

  resetearFormulario(): void {
    this.nuevaDeuda = {
      recorrido_id: '',
      fecha_venta: new Date().toISOString().split('T')[0],
      cantidad_garrafones: 1,
      tipo_garrafon: 'Bonafont',
      monto_total: 0,
      fecha_vencimiento: this.calcularFechaVencimiento(7),
      metodo_pago: 'efectivo',
      notas: ''
    };
  }

  seleccionarDeuda(deuda: any): void {
    this.deudaSeleccionada = deuda;
    this.nuevoPago = {
      monto: Math.min(deuda.saldo_pendiente, deuda.saldo_pendiente),
      metodo_pago: 'efectivo',
      notas: ''
    };
    // Mostrar el modal
    const modalElement = document.getElementById('pagoModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  registrarPago(): void {
    if (!this.deudaSeleccionada || this.nuevoPago.monto <= 0) {
    
      return;
    }

    const pagoData = {
      monto: this.nuevoPago.monto,
      fecha_pago: new Date().toISOString().split('T')[0],
      metodo_pago: this.nuevoPago.metodo_pago,
      notas: this.nuevoPago.notas
    };

    this.deudasService.registrarPago(this.deudaSeleccionada.id, pagoData).subscribe({
      next: () => {
        this.cargarDeudas();
        this.deudaSeleccionada = null;
        const modalElement = document.getElementById('pagoModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
      
      },
      error: (error) => {
        console.log("Error al registrar pago", error);
        
      }
    });
  }

  eliminarDeuda(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta deuda?')) {
      this.deudasService.eliminarDeuda(id).subscribe({
        next: () => {
          this.cargarDeudas();
        
        },
        error: (error) => {
          console.log("Error al eliminar deuda", error);
          
        }
      });
    }
  }

  actualizarRegistrosMostrar(): void {
    console.log(`Mostrando ${this.registrosMostrar} registros`);
    // Aquí puedes implementar lógica para limitar los registros mostrados
  }

  deudasFiltradas(): any[] {
    return this.deudas.filter(deuda => 
      (deuda.cliente && deuda.cliente.toLowerCase().includes(this.filtro.toLowerCase())) ||
      (deuda.tipo_garrafon && deuda.tipo_garrafon.toLowerCase().includes(this.filtro.toLowerCase())) ||
      (deuda.estado_pago && deuda.estado_pago.toLowerCase().includes(this.filtro.toLowerCase())) ||
      (deuda.notas && deuda.notas.toLowerCase().includes(this.filtro.toLowerCase()))
    );
  }
}