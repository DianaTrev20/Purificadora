import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../shared/pipes/filter.pipe';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-recorridos',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './recorridos.component.html',
  styleUrls: ['./recorridos.component.css']
})
export class RecorridosComponent implements OnInit {
  recorridos: any[] = [];
  recorridosFiltrados: any[] = [];
  searchText = '';
  mostrarModal: boolean = false;
  editando: boolean = false;
  recorrido: any = { cliente: '', garrafon: '', barrio: '', precio: '', dia_semana: '' };
  diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  diaSeleccionado: string = '';

  // Opciones para cantidad de registros a mostrar
  opcionesRegistros: number[] = [10, 50, 80, 100, 9999]; // 9999 representa "Todos"
  registrosMostrar: number = 10; // Valor inicial

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {

    this.obtenerRecorridos();

  }

  obtenerRecorridos() {
    this.apiService.getRecorridos().subscribe({
      next: (data: any) => {
        this.recorridos = data;
        this.filtrarPorDia();
      },
      error: (err) => {
        console.error('Error al obtener los recorridos:', err);
      }
    });
  }

  seleccionarDia(dia: string) {
    this.diaSeleccionado = dia;
    this.filtrarPorDia();
  }

  filtrarPorDia() {
    if (this.diaSeleccionado) {
      this.recorridosFiltrados = this.recorridos.filter(r => r.dia_semana === this.diaSeleccionado);
    } else {
      this.recorridosFiltrados = [...this.recorridos];
    }
  }

  actualizarRegistrosMostrar() {
    // Se ejecuta cada vez que se cambia el número de registros a mostrar
    this.filtrarPorDia();
  }

  abrirModal(editando: boolean, recorrido?: any) {
    this.mostrarModal = true;
    this.editando = editando;
    this.recorrido = editando ? { ...recorrido } : { cliente: '', garrafon: '', barrio: '', precio: '', dia_semana: '' };
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarRecorrido() {
    if (this.editando && this.recorrido.id) {
      this.apiService.updateRecorrido(this.recorrido.id, this.recorrido).subscribe({
        next: () => {
          console.log('✅ Recorrido actualizado correctamente');
          this.obtenerRecorridos();
          this.cerrarModal();
        },
        error: (err) => console.error('🚨 Error al actualizar el recorrido:', err)
      });
    } else {
      this.apiService.addRecorrido(this.recorrido).subscribe({
        next: (data) => {
          console.log('✅ Recorrido agregado:', data);
          this.recorridos.push(data);
          this.filtrarPorDia();
          this.cerrarModal();
        },
        error: (err) => console.error('🚨 Error al agregar el recorrido:', err)
      });
    }
  }

  eliminarRecorrido(id: number) {
    this.apiService.deleteRecorrido(id).subscribe({
      next: () => {
        this.recorridos = this.recorridos.filter(recorrido => recorrido.id !== id);
        this.filtrarPorDia();
        console.log('Recorrido eliminado:', id);
      },
      error: (err) => {
        console.error('Error al eliminar el recorrido:', err);
      }
    });
  }


  
}
