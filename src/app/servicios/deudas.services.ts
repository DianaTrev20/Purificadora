import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeudasService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // Obtener todas las deudas
  getDeudas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deudas`);
  }

  // Obtener deudas pendientes
  getDeudasPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deudas/pendientes`);
  }

  // Obtener deudas por cliente (usando recorrido_id)
  getDeudasPorCliente(recorridoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deudas/cliente/${recorridoId}`);
  }

  // Crear nueva deuda
  crearDeuda(deudaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/deudas`, deudaData);
  }

  // Actualizar deuda
  actualizarDeuda(id: number, deudaData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/deudas/${id}`, deudaData);
  }

  // Eliminar deuda
  eliminarDeuda(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deudas/${id}`);
  }

  // Registrar un pago
  registrarPago(deudaId: number, pagoData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/deudas/${deudaId}/pagos`, pagoData);
  }

  // Obtener historial de pagos de una deuda
  getPagosDeDeuda(deudaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deudas/${deudaId}/pagos`);
  }
}