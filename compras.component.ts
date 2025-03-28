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
  productos: any[] = []; // Añadido para la lista de productos
  nuevaCompra: any = {
    proveedor_id: '',
    producto_id: '', // Cambiado de producto a producto_id
    cantidad: 1,
    costo_total: 0, // Cambiado de precio_unitario a costo_total
    fecha_compra: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    notas: '' // Añadido campo notas
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
    this.cargarProductos(); // Nueva función para cargar productos
    // this.configurarSocket();
  }

  cargarProductos(): void {
    this.comprasService.getProductos().subscribe({
      next: (data) => this.productos = data,
      error: (error) => console.log("Error al cargar productos")
    });
  }

  cargarCompras(): void {
    this.comprasService.getCompras().subscribe({
      next: (data) => this.compras = data,
      error: (error) => console.log("Error al cargar compras")
    });
  }

  cargarProveedores(): void {
    this.comprasService.getProveedores().subscribe({
      next: (data) => this.proveedores = data,
      error: (error) => console.log("Error al cargar proveedores")
    });
  }

  select_proveedor_cambiado(valor): void
  {
    this.nuevaCompra.proveedor_id = valor;
  }

  select_producto_cambiado(valor): void
  {
    this.nuevaCompra.producto_id = valor;
  }

  input_cantidad_cambiado(valor): void
  {
    this.nuevaCompra.cantidad = valor;
  }

  input_notas_cambiado(valor): void
  {
    this.nuevaCompra.notas = valor;
  }

  input_costo_cambiado(valor): void
  {
    this.nuevaCompra.costo_total = valor;
  }


  crearCompra(): void {


    console.log("nueva compra", this.nuevaCompra);
    
    this.comprasService.crearCompra(this.nuevaCompra).subscribe({
      next: () => {
        this.cargarCompras();
        this.resetearFormulario();
      },
      error: (error) => console.log("Error al crear compra")
    });
  }

  resetearFormulario(): void {
    this.nuevaCompra = {
      proveedor_id: '',
      producto_id: '',
      cantidad: 1,
      costo_total: 0,
      fecha_compra: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
      notas: ''
    };
  }

  actualizarEstado(id: number, estado: string): void {
    this.comprasService.actualizarCompra(id, estado).subscribe({
      next: () => this.cargarCompras(),
      error: (error) => console.log("Error al actualizar compra")
    });
  }

  eliminarCompra(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta compra?')) {
      this.comprasService.eliminarCompra(id).subscribe({
        next: () => this.cargarCompras(),
        error: (error) => console.log("Error al eliminar la compra")
      });
    }
  }

  comprasFiltradas(): any[] {
    return this.compras.filter(compra => 
      (compra.nombre_producto && compra.nombre_producto.toLowerCase().includes(this.filtro.toLowerCase())) ||
      (compra.nombre_proveedor && compra.nombre_proveedor.toLowerCase().includes(this.filtro.toLowerCase())) ||
      compra.estado.toLowerCase().includes(this.filtro.toLowerCase()) ||
      (compra.notas && compra.notas.toLowerCase().includes(this.filtro.toLowerCase()))
    );
  }
}