import { Component, OnInit } from '@angular/core';
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
  recorrido: any = { 
    cliente: '', 
    garrafon: '', 
    barrio: '', 
    precio: null, 
    dia_semana: '' 
  };
  diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  diaSeleccionado: string = '';

  // Opciones para cantidad de registros a mostrar
  opcionesRegistros: number[] = [10, 50, 80, 100, 9999];
  registrosMostrar: number = 10;

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
    this.filtrarPorDia();
  }

  abrirModal(editando: boolean, recorrido?: any) {
    this.mostrarModal = true;
    this.editando = editando;
    
    if (editando && recorrido) {
      this.recorrido = { ...recorrido };
    } else {
      this.recorrido = { 
        cliente: '', 
        garrafon: '', 
        barrio: '', 
        precio: null, 
        dia_semana: '' 
      };
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarRecorrido() {
    if (this.editando) {
      this.apiService.updateRecorrido(this.recorrido.id, this.recorrido).subscribe({
        next: (data) => {
          const index = this.recorridos.findIndex(r => r.id === this.recorrido.id);
          if (index !== -1) {
            this.recorridos[index] = data;
          }
          this.filtrarPorDia();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al actualizar recorrido:', err);
          alert('Error al actualizar el recorrido');
        }
      });
    } else {
      this.apiService.addRecorrido(this.recorrido).subscribe({
        next: (data) => {
          this.recorridos.push(data);
          this.filtrarPorDia();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al agregar recorrido:', err);
          alert('Error al agregar el recorrido');
        }
      });
    }
  }

  eliminarRecorrido(id: number) {
    if (confirm('¿Estás seguro de eliminar este recorrido?')) {
      this.apiService.deleteRecorrido(id).subscribe({
        next: () => {
          this.recorridos = this.recorridos.filter(r => r.id !== id);
          this.filtrarPorDia();
        },
        error: (err) => {
          console.error('Error al eliminar recorrido:', err);
          alert('Error al eliminar el recorrido');
        }
      });
    }
  }
}