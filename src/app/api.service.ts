import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// api.service.ts
export interface Producto {
  id?: number;
  nombre_producto: string;
  categoria: string;
  cantidad_stock: number;
  unidad_medida: string;
  precio_compra: number;
  precio_venta: number | null; // <-- precio_venta puede ser null
  proveedor_id: string; // <-- Cambiar de number a string
  fecha_entrada: string; // o Date si lo manejas así
  fecha_caducidad?: string | null;
  ubicacion: string;
  estado: 'Disponible' | 'Agotado' | 'En uso'; // Usar enum
  notas?: string | null;
  stock_minimo: number; // <-- Añadir si falta
  nombre_proveedor?: string; // <-- Campo opcional para el JOIN
}




@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // OBTENER NOTIFICACIONES
  obtener_notificaciones(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notificaciones`);
  }

  // LOGIN
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { username, password });
  }

  // USUARIOS
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios`);
  }

  // RECORRIDOS
  getRecorridos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/recorridos`);
  }

  addRecorrido(recorrido: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/recorridos`, recorrido);
  }

  updateRecorrido(id: number, recorrido: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/recorridos/${id}`, recorrido);
  }

  deleteRecorrido(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/recorridos/${id}`);
  }

  // api.service.ts
  getInventario(): Observable<Producto[]> {
    // Verifica que la URL sea correcta (ej: http://localhost:3000/inventario)
    return this.http.get<Producto[]>(`${this.baseUrl}/inventario`);
  }
  getProveedores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/proveedores`);
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/inventario/${id}`);
  }

  addProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/inventario`, producto);
  }

  updateProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/inventario/${id}`, producto);
  }

  // VENDER UN PRODUCTO (De donde sacamos la cantidad que se vendió ¿¿??)
  venderProducto(id: number, producto: Producto, cantidad: number): Observable<Producto> {
    producto.cantidad_stock = cantidad;

    return this.http.put<Producto>(`${this.baseUrl}/inventario/${id}`, producto);
  }



  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/inventario/${id}`);
  }

  // NOTIFICACIONES (Stock bajo)
  getNotificaciones(): Observable<{ id: number; mensaje: string }[]> {
    return this.http.get<{ id: number; mensaje: string }[]>(`${this.baseUrl}/inventario/notificaciones`);
  }

  // En tu ApiService
marcar_notificacion_leida(id: number): Observable<any> {
  return this.http.patch(`${this.baseUrl}/notificaciones/${id}/leer`, {});
}

marcar_todas_leidas(): Observable<any> {
  return this.http.post(`${this.baseUrl}/notificaciones/marcar-todas-leidas`, {});
}

// NOTIFICACIONES DE STOCK
guardarNotificacionStock(notificacion: {
  producto_id: number | undefined;
  mensaje: string;
  tipo: string;
  stock_actual: number;
  stock_minimo: number;
}): Observable<any> {
  return this.http.post(`${this.baseUrl}/notificaciones/stock`, notificacion);
}
}
