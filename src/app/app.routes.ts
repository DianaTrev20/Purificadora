import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RecorridosComponent } from './recorridos/recorridos.component';
import { InventarioComponent } from './inventario/inventario.component';
import { AgendaComponent } from './agenda/agenda.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ComprasComponent } from './compras/compras.component';
import { ReportesComponent } from './reportes/reportes.component';
import { DeudasComponent } from './deudas/deudas.component';
import { DanosGarrafonesComponent } from './danos-garrafones/danos-garrafones.component';

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
    component: ComprasComponent
  },
  { 
    path: 'reportes', 
    component: ReportesComponent
  },
  { 
    path: 'deudas', 
    component: DeudasComponent
  },
  { 
    path: 'danos', 
    component: DanosGarrafonesComponent
  },
  { 
    path: '', 
    redirectTo: '/home', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/home' 
  }
];