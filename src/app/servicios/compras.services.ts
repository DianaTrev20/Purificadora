import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {
  exportarPDF(id: any) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getCompras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/compras`);
  }

  getProveedores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/proveedores`);
  }

  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`);
  }

  crearCompra(compraData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/compras`, compraData);
  }

  actualizarCompra(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/compras/${id}`, { estado });
  }

  actualizarCompraCompleta(id: number, compraData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/compras/${id}`, compraData);
  }

  eliminarCompra(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/compras/${id}`);
  }

  obtenerHistorialCompra(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/compras/${id}/historial`);
  }

  exportarHistorialPDF(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/compras/${id}/historial/pdf`, {
      responseType: 'blob'
    });
  }

  exportarHistorialExcel(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/compras/${id}/historial/excel`, {
      responseType: 'blob'
    });
  }

  buscarCompras(filtro: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/compras/buscar?q=${filtro}`);
  }
}