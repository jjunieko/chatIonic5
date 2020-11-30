import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { PerfilDoUsuarioPageRoutingModule } from "./perfil-do-usuario-routing.module";

import { PerfilDoUsuarioPage } from "./perfil-do-usuario.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilDoUsuarioPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [PerfilDoUsuarioPage],
})
export class PerfilDoUsuarioPageModule {}
