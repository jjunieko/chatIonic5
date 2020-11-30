import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilDoUsuarioPage } from './perfil-do-usuario.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilDoUsuarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilDoUsuarioPageRoutingModule {}
