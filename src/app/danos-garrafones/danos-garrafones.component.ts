import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DanosService } from '../servicios/danos.services';
import { NotificacionesService } from '../servicios/notificaciones.service';
import { ApiService } from '../api.service';


@Component({
  selector: 'app-danos-garrafones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './danos-garrafones.component.html',
  styleUrls: ['./danos-garrafones.component.css']
})
export class DanosGarrafonesComponent implements OnInit {
  danos: any[] = [];
  clientes: any[] = [];
  
  // Propiedades para filtrado y paginación
  registrosMostrar: number = 10;
  opcionesRegistros: number[] = [5, 10, 25, 50, 100];
  filtro: string = '';
  
  // Tipos de datos para selects
  tiposGarrafon = ['Bonafont', 'Azul', 'Varios', 'Otro'];
  tiposDano = ['quebrado', 'rayado', 'sucio', 'perdida', 'otro'];
  responsables = ['cliente', 'vendedor', 'transporte', 'otro'];
  estados = ['reportado', 'en_revision', 'resuelto', 'cobrado'];
  
  // Objetos para formularios
  nuevoDano: any = {
    recorrido_id: '',
    cantidad_danados: 1,
    tipo_garrafon: 'Bonafont',
    tipo_dano: 'quebrado',
    responsable: 'cliente',
    cliente: '',
    barrio: '',
    monto_cobro: 0,
    notas: ''
  };
  
  danoSeleccionado: any = null;

  constructor(
    private danosService: DanosService,
    private notificationService: NotificacionesService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.cargarDanos();
    this.cargarClientes();
  }

  cargarDanos(): void {
    this.danosService.getDanos().subscribe({
      next: (data) => this.danos = data,
      error: (error) => {
        console.error('Error al cargar daños', error);
       
      }
    });
  }

  cargarClientes(): void {
    this.apiService.getRecorridos().subscribe({
      next: (data) => this.clientes = data,
      error: (error) => {
        console.error('Error al cargar clientes', error);
    
      }
    });
  }

  actualizarRegistrosMostrar(): void {
    console.log(`Mostrando ${this.registrosMostrar} registros`);
    // Implementar lógica de paginación si es necesario
  }

  seleccionarDano(dano: any): void {
    this.danoSeleccionado = {...dano};
  }

  reportarDano(): void {
    // Asignar fecha actual si no existe
    if (!this.nuevoDano.fecha_reporte) {
      this.nuevoDano.fecha_reporte = new Date().toISOString();
    }

    this.danosService.reportarDano(this.nuevoDano).subscribe({
      next: () => {
        this.cargarDanos();
        this.resetearFormulario();
       
      },
      error: (error) => {
        console.error('Error al reportar daño', error);
      
      }
    });
  }

  actualizarDano(): void {
    if (!this.danoSeleccionado) return;

    this.danosService.actualizarDano(this.danoSeleccionado.id, this.danoSeleccionado).subscribe({
      next: () => {
        this.cargarDanos();
      
      },
      error: (error) => {
        console.error('Error al actualizar daño', error);
      
      }
    });
  }

  cambiarEstado(id: number, nuevoEstado: string): void {
    this.danosService.cambiarEstadoDano(id, nuevoEstado).subscribe({
      next: () => {
        this.cargarDanos();
       
      },
      error: (error) => {
        console.error('Error al cambiar estado', error);
     
      }
    });
  }

  registrarCobro(): void {
    if (!this.danoSeleccionado) return;

    const cobroData = {
      monto: this.danoSeleccionado.monto_cobro,
      fecha_cobro: new Date().toISOString(),
      metodo_pago: 'efectivo' // Puedes hacer esto configurable
    };

    this.danosService.registrarCobroDano(this.danoSeleccionado.id, cobroData).subscribe({
      next: () => {
        this.cambiarEstado(this.danoSeleccionado.id, 'cobrado');
      },
      error: (error) => {
        console.error('Error al registrar cobro', error);
     
      }
    });
  }

  eliminarDano(id: number): void {
    if (confirm('¿Estás seguro de eliminar este reporte de daño?')) {
      this.danosService.eliminarDano(id).subscribe({
        next: () => {
          this.cargarDanos();
         
        },
        error: (error) => {
          console.error('Error al eliminar daño', error);
      
        }
      });
    }
  }

  resetearFormulario(): void {
    this.nuevoDano = {
      recorrido_id: '',
      cantidad_danados: 1,
      tipo_garrafon: 'Bonafont',
      tipo_dano: 'quebrado',
      responsable: 'cliente',
      cliente: '',
      barrio: '',
      monto_cobro: 0,
      notas: ''
    };
  }

  danosFiltrados(): any[] {
    return this.danos.filter(dano => 
      (dano.cliente && dano.cliente.toLowerCase().includes(this.filtro.toLowerCase())) ||
      (dano.barrio && dano.barrio.toLowerCase().includes(this.filtro.toLowerCase())) ||
      (dano.tipo_garrafon && dano.tipo_garrafon.toLowerCase().includes(this.filtro.toLowerCase())) ||
      (dano.tipo_dano && dano.tipo_dano.toLowerCase().includes(this.filtro.toLowerCase())) ||
      (dano.estado && dano.estado.toLowerCase().includes(this.filtro.toLowerCase()))
    );
  }

  // Métodos para manejar cambios en los inputs
  select_cliente_cambiado(event: any): void {
    const clienteId = event.target.value;
    const cliente = this.clientes.find(c => c.id == clienteId);
    if (cliente) {
      this.nuevoDano.recorrido_id = clienteId;
      this.nuevoDano.cliente = cliente.cliente;
      this.nuevoDano.barrio = cliente.barrio;
    }
  }

  input_cantidad_cambiado(valor: number): void {
    this.nuevoDano.cantidad_danados = valor;
  }

  select_tipo_garrafon_cambiado(valor: string): void {
    this.nuevoDano.tipo_garrafon = valor;
  }

  select_tipo_dano_cambiado(valor: string): void {
    this.nuevoDano.tipo_dano = valor;
    this.calcularMontoCobro();
  }

  select_responsable_cambiado(valor: string): void {
    this.nuevoDano.responsable = valor;
  }

  input_monto_cobro_cambiado(valor: number): void {
    this.nuevoDano.monto_cobro = valor;
  }

  input_notas_cambiado(valor: string): void {
    this.nuevoDano.notas = valor;
  }

  calcularMontoCobro(): void {
    // Lógica para calcular monto según tipo de daño
    const preciosBase: {[key: string]: number} = {
      'quebrado': 50,
      'rayado': 20,
      'sucio': 10,
      'perdida': 60,
      'otro': 30
    };
    
    const precioBase = preciosBase[this.nuevoDano.tipo_dano] || 0;
    this.nuevoDano.monto_cobro = this.nuevoDano.cantidad_danados * precioBase;
  }
}