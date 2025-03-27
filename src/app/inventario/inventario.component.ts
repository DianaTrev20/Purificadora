import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../shared/pipes/filter.pipe';
import { ApiService, Producto } from '../api.service';
import { RouterModule } from '@angular/router'; 
import { AppComponent } from '../app.component';
import { NotificacionesService } from '../servicios/notificaciones.service';


@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  inventario: Producto[] = [];
  notificaciones: { id: number; mensaje: string }[] = [];
  mostrarNotif: boolean = false;
  stockMinimo: number = 5;
  opcionesRegistros: (number | string)[] = [10, 20, 50, 100, 'Todos'];
  cantidadRegistros: number | string = 10; 

  constructor(private apiService: ApiService/*, private router: RouterModule*/) { }

  ngOnInit(): void {
    this.loadInventario();
    // this.loadNotificaciones();
  }

  loadInventario(): void {
    this.apiService.getInventario().subscribe(
      (data) => this.inventario = data,
      (error) => console.error('Error al obtener inventario:', error)
    );
  }

  loadNotificaciones(): void {
    this.apiService.getNotificaciones().subscribe(
      (data) => this.notificaciones = data,
      (error) => console.error('Error al obtener notificaciones:', error)
    );
  }

  mostrarNotificaciones(): void {
    this.mostrarNotif = !this.mostrarNotif;
  }

  irAProducto(id: number): void {
    // this.router.p(['/inventario', id]);
  }

  actualizarCantidadRegistros(): void {
    if (this.cantidadRegistros === 'Todos') {
      this.cantidadRegistros = this.inventario.length;
    } else {
      this.cantidadRegistros = Number(this.cantidadRegistros);
    }
  }

  agregarProducto(): void {
    const nuevoProducto: Producto = {
      nombre: 'Nuevo Producto',
      categoria: 'Categoría',
      cantidad: 10,
      unidad_medida: 'Unidades',
      precio_compra: 100,
      precio_venta: 150,
      proveedor: 'Proveedor X',
      ubicacion: 'Almacén A'
    };

    this.apiService.addProducto(nuevoProducto).subscribe(
      () => this.loadInventario(),
      (error) => console.error('Error al agregar producto:', error)
    );
  }

  editarProducto(producto: Producto): void {
    producto.nombre = 'Producto Editado';

    this.apiService.updateProducto(producto.id!, producto).subscribe(
      () => this.loadInventario(),
      (error) => console.error('Error al editar producto:', error)
    );
  }

  venderProducto(producto: Producto): void
  {

    this.apiService.venderProducto(producto.id!, producto, 1).subscribe(() => 
    {
      this.loadInventario();

    },
      (error) => console.error('Error al editar producto:', error)
    );
  }

  eliminarProducto(id: number): void {
    this.apiService.deleteProducto(id).subscribe(() => 

      this.loadInventario(),

      (error) => console.error('Error al eliminar producto:', error)
    );
  }
}