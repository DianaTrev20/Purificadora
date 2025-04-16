import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DanosService {
  private apiUrl = `${environment.apiUrl}/danos-garrafones`; // Ruta base única

  constructor(private http: HttpClient) { }

  // Todos los métodos usan this.apiUrl sin añadir más segmentos
  getDanos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDanosPorEstado(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?estado=${estado}`);
  }

  getDanosPorRecorrido(recorridoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?recorrido_id=${recorridoId}`);
  }

  reportarDano(danoData: any): Observable<any> {
    return this.http.post(this.apiUrl, danoData);
  }

  actualizarDano(id: number, danoData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, danoData);
  }

  eliminarDano(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  cambiarEstadoDano(id: number, nuevoEstado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado: nuevoEstado });
  }

  registrarCobroDano(id: number, cobroData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cobros`, cobroData);
  }
}