import { ApiService, Producto } from '../api.service';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificacionesService } from '../servicios/notificaciones.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  inventario: Producto[] = [];
  proveedores: any[] = [];
  estados = ['Disponible', 'Agotado', 'En uso'];
  nuevoProducto: Producto;
  productoEditando: Producto | null = null;

  @ViewChild('nuevoProductoModal') nuevoProductoModal!: ElementRef;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notificacionesService: NotificacionesService
  ) {
    this.nuevoProducto = this.inicializarProducto();
  }

  ngOnInit(): void {
    this.cargarInventario();
    this.cargarProveedores();
  }

  cargarInventario(): void {
    this.apiService.getInventario().subscribe({
      next: (data) => {
        this.inventario = data;
        this.verificarStockBajo();
      },
      error: (error) => console.error("Error al cargar productos:", error)
    });
  }

  cargarProveedores(): void {
    this.apiService.getProveedores().subscribe({
      next: (data) => this.proveedores = data,
      error: (error) => console.error("Error al cargar proveedores:", error)
    });
  }

  private inicializarProducto(): Producto {
    return {
      nombre_producto: '',
      categoria: '',
      cantidad_stock: 0,
      stock_minimo: 5,
      unidad_medida: 'Unidad',
      precio_compra: 0,
      precio_venta: null,
      proveedor_id: '',
      ubicacion: 'Almacén Principal',
      fecha_entrada: new Date().toISOString().split('T')[0],
      estado: 'Disponible',
      notas: null
    };
  }

  // Cargar datos para edición
  cargarParaEdicion(producto: Producto): void {
    this.productoEditando = producto;
    // Clonamos el producto manteniendo el formato de fecha correcto
    this.nuevoProducto = {
      ...producto,
      fecha_entrada: producto.fecha_entrada.split('T')[0], // Aseguramos formato YYYY-MM-DD
      fecha_caducidad: producto.fecha_caducidad ? producto.fecha_caducidad.split('T')[0] : null
    };
    this.abrirModal();
  }

  // Abrir modal
  abrirModal(): void {
    const modalElement = this.nuevoProductoModal.nativeElement;
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  // Cerrar modal
  cerrarModal(): void {
    const modalElement = this.nuevoProductoModal.nativeElement;
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
    this.resetearFormulario();
  }

  guardarProducto(): void {
    // Validar que no haya valores negativos
    if (this.nuevoProducto.cantidad_stock < 0 || this.nuevoProducto.precio_compra < 0 || 
        (this.nuevoProducto.precio_venta && this.nuevoProducto.precio_venta < 0)) {
      this.notificacionesService.emit('notificacion', {
        mensaje: 'No se permiten valores negativos',
        tipo: 'danger'
      });
      return;
    }

    if (this.productoEditando) {
      this.actualizarProducto();
    } else {
      this.crearProducto();
    }
  }
  // Actualizar producto existente
  private actualizarProducto(): void {
    if (!this.productoEditando) return;

    // Preparamos los datos para actualizar
    const datosActualizacion = { ...this.nuevoProducto };
    delete datosActualizacion.nombre_proveedor; // Eliminamos campo de solo lectura

    this.apiService.updateProducto(this.productoEditando.id!, datosActualizacion).subscribe({
      next: () => {
        this.cargarInventario();
        this.cerrarModal();
        this.verificarStockBajo();
      },
      error: (err) => {
        console.error('Error al actualizar producto:', err);
        this.notificacionesService.emit('notificacion', {
          mensaje: 'Error al actualizar el producto: ' + err.message,
          tipo: 'danger'
        });
      }
    });
  }

  crearProducto(): void {
    this.apiService.addProducto(this.nuevoProducto).subscribe({
      next: () => {
        this.cargarInventario();
        this.resetearFormulario();
        this.cerrarModal();

        if (this.nuevoProducto.cantidad_stock < this.nuevoProducto.stock_minimo) {
          this.generarNotificacionStockBajo(
            this.nuevoProducto, 
            this.nuevoProducto.cantidad_stock, 
            this.nuevoProducto.stock_minimo
          );
        }
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        this.notificacionesService.emit('notificacion', {
          mensaje: 'Error al crear el producto',
          tipo: 'danger'
        });
      }
    });
  }

  generarNotificacionStockBajo(producto: Producto, stockActual: number, stockMinimo: number): void {
    const nivel = stockActual <= 0 ? 'danger' : 'warning';
    const mensaje = `Stock bajo para ${producto.nombre_producto}: ${stockActual} (Mínimo: ${stockMinimo})`;
    
    // Emitir notificación al servicio global
    this.notificacionesService.emit('notificacion', {
      mensaje: mensaje,
      tipo: nivel,
      fecha: new Date().toISOString(),
      visto: false
    });
  
    // Guardar en el backend usando el endpoint correcto
    this.apiService.guardarNotificacionStock({
      producto_id: producto.id,
      mensaje: mensaje,
      tipo: nivel, // Cambiado de 'nivel' a 'tipo' para coincidir con tu interfaz
      stock_actual: stockActual,
      stock_minimo: stockMinimo
    }).subscribe({
      error: (err) => console.error('Error al guardar notificación:', err)
    });
  }

  verificarStockBajo(): void {
    this.inventario.forEach(producto => {
      if (producto.cantidad_stock < producto.stock_minimo) {
        const nivel = producto.cantidad_stock <= 0 ? 'danger' : 'warning';
        const mensaje = `Stock bajo para ${producto.nombre_producto}: ${producto.cantidad_stock} (Mínimo: ${producto.stock_minimo})`;
        
        // Solo emitir si es crítico (stock = 0) para evitar duplicados
        if (producto.cantidad_stock <= 0) {
          this.notificacionesService.emit('notificacion', {
            mensaje: mensaje,
            tipo: nivel,
            fecha: new Date().toISOString(),
            visto: false
          });
        }
      }
    });
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.apiService.deleteProducto(id).subscribe({
        next: () => {
          this.cargarInventario();
          this.notificacionesService.emit('notificacion', {
            mensaje: 'Producto eliminado correctamente',
            tipo: 'success'
          });
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          this.notificacionesService.emit('notificacion', {
            mensaje: 'Error al eliminar el producto',
            tipo: 'danger'
          });
        }
      });
    }
  }

  resetearFormulario(): void {
    this.nuevoProducto = this.inicializarProducto();
    this.productoEditando = null;
  }
}