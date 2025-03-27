import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RecorridosComponent } from './recorridos/recorridos.component';
import { InventarioComponent } from './inventario/inventario.component';
import { AgendaComponent } from './agenda/agenda.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ComprasComponent } from './compras/compras.component';
import { ReportesComponent } from './reportes/reportes.component';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent
  },
  { 
    path: 'home', 
    component: HomeComponent
  },
  { 
    path: 'recorridos', 
    component: RecorridosComponent
  },
  { 
    path: 'inventario', 
    component: InventarioComponent
  },
  { 
    path: 'agenda', 
    component: AgendaComponent
  },
  { 
    path: 'clientes', 
    component: ClientesComponent
  },
  { 
    path: 'compras', 
    component: ComprasComponent,
    // Si necesitas cargar datos antes de mostrar el componente
    // resolve: {
    //   comprasData: ComprasResolver
    // }
  },
  { 
    path: 'reportes', 
    component: ReportesComponent
  },
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  // Ruta de respaldo para 404
  { 
    path: '**', 
    redirectTo: '/home' 
  }
];