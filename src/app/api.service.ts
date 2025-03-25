import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id?: number;
  nombre: string;
  categoria: string;
  cantidad: number;
  unidad_medida: string;
  precio_compra: number;
  precio_venta: number;
  proveedor: string;
  ubicacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // OBTENER NOTIFICACIONES
  obtener_notificaciones(): Observable<any>
  {
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

  // INVENTARIO
  getInventario(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/inventario`);
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
  venderProducto(id: number, producto: Producto, cantidad: number): Observable<Producto>
  {
    producto.cantidad = cantidad;
    
    return this.http.put<Producto>(`${this.baseUrl}/inventario/${id}`, producto);
  }

  

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/inventario/${id}`);
  }

  // NOTIFICACIONES (Stock bajo)
  getNotificaciones(): Observable<{ id: number; mensaje: string }[]> {
    return this.http.get<{ id: number; mensaje: string }[]>(`${this.baseUrl}/inventario/notificaciones`);
  }
}
