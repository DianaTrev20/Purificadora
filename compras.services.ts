import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getCompras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/compras`);
  }

  getProveedores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/proveedores`);
  }

  // Nuevo método para obtener productos
  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`);
  }

  crearCompra(compraData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/compras`, compraData);
  }

  // Cambiado de patch a put para coincidir con tu backend
  actualizarCompra(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/compras/${id}`, { estado });
  }

  eliminarCompra(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/compras/${id}`);
  }

  // Método adicional para buscar compras por filtro (opcional)
  buscarCompras(filtro: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/compras/buscar?q=${filtro}`);
  }
}