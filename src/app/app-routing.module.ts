import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
//importados
import {
  canActivate,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
} from "@angular/fire/auth-guard";

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(["/"]);

const redirectLoggedInToChat = () => redirectLoggedInTo(["/chat"]);

const routes: Routes = [
  /*   {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }, */
  {
    path: "",
    loadChildren: () =>
      import("./pages/login/login.module").then((m) => m.LoginPageModule),
    //vai levar direto para uma pagina
    ...canActivate(redirectLoggedInToChat),
  },
  {
    path: "chat",
    loadChildren: () =>
      import("./pages/chat/chat.module").then((m) => m.ChatPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'modal-perfil-user',
    loadChildren: () => import('./pages/modal-perfil-user/modal-perfil-user.module').then( m => m.ModalPerfilUserPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
