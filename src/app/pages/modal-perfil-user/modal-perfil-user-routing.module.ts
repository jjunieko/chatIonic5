import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalPerfilUserPage } from './modal-perfil-user.page';

const routes: Routes = [
  {
    path: '',
    component: ModalPerfilUserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalPerfilUserPageRoutingModule {}
