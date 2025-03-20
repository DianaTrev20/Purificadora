import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecorridosComponent } from './recorridos/recorridos.component';
import { HomeComponent } from './home/home.component';
import { InventarioComponent } from './inventario/inventario.component';
import { AgendaComponent } from './agenda/agenda.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ComprasComponent } from './compras/compras.component';
import { ReportesComponent } from './reportes/reportes.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent },
  { path: 'inicio', component: HomeComponent }, 
  { path: 'recorridos', component: RecorridosComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'agenda', component: AgendaComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'compras', component: ComprasComponent },
  { path: 'reportes', component: ReportesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }