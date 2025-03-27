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
    return this.http.get<any[]>(`${environment.apiUrl}/proveedores`);
  }

  crearCompra(compraData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/compras`, compraData);
  }

  actualizarCompra(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { estado });
  }

  eliminarCompra(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Método adicional para buscar compras por filtro (opcional)
  buscarCompras(filtro: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar?q=${filtro}`);
  }
}