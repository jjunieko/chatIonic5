import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { ModalPerfilUserPageRoutingModule } from "./modal-perfil-user-routing.module";

import { ModalPerfilUserPage } from "./modal-perfil-user.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalPerfilUserPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [ModalPerfilUserPage],
})
export class ModalPerfilUserPageModule {}
