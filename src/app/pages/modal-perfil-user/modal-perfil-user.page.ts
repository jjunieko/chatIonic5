import { Component, Input, OnInit } from "@angular/core";
import { LoadingController, ModalController } from "@ionic/angular";
import { FormGroup, FormBuilder } from "@angular/forms";
//import { ComidaService } from "../services/comida.service";
import { ToastController } from "@ionic/angular";
import { ChatService } from "src/app/services/chat.service";
//import { Comida } from "../models/comida";

@Component({
  selector: "app-modal-perfil-user",
  templateUrl: "./modal-perfil-user.page.html",
  styleUrls: ["./modal-perfil-user.page.scss"],
})
export class ModalPerfilUserPage implements OnInit {
  @Input() id: number;

  public isEdit: boolean = false;
  public form: FormGroup;
  public carregar: any;

  constructor(
    public modal: ModalController,
    public formBuilder: FormBuilder,
    //public comida: ComidaService,
    public loading: LoadingController,
    public toastControl: ToastController,
    public chat: ChatService
  ) {
    this.form = formBuilder.group({
      nome: [""],
      tipo: [""],
      avaliacao: [""],
      horaEntrega: [""],
      dataEntrega: [""],
      observacoes: [""],
    });
  }

  async ngOnInit(): Promise<void> {
    if (this.id || this.id === 0) {
      await this.editarProntuario();
      this.isEdit = true;

      console.log(this.id, "editação do isedit");
    }
  }

  public async editarProntuario(): Promise<void> {
    await this.showCarregar();
    const editarPront = await this.chat.getUsers();
    console.log(editarPront, "saber minha edição do prontuario");
    this.form.patchValue(editarPront);
    await this.fecharCarregando();
  }

  async showMensagem(): Promise<void> {
    let message: string = "Perfil atualizado com Sucesso";
    if (this.isEdit) {
      message = "Perfil atualizado com sucesso";
    } else {
      alert("erro ao atualizar perfil");
    }
    const toast = await this.toastControl.create({
      message: message,
      duration: 2000,
      color: "success",
    });

    toast.present();
  }

  public fecharModal(): void {
    this.modal.dismiss();
  }

  public async submitForm(): Promise<void> {
    await this.showCarregar();
    //console.log(this.form.value);
    this.chat.salvarProntuarioPerfil(this.form.value, this.id);
    await this.fecharCarregando();
    this.fecharModal();
    this.showMensagem();
  }

  async showCarregar(): Promise<void> {
    this.carregar = await this.loading.create({
      message: "Aguarde...",
    });
    await this.carregar.present();
  }
  async fecharCarregando(): Promise<void> {
    await this.carregar.dismiss();
  }

  /*   public async remover(id: number): Promise<void> {
    await this.perfilUser.remover(id);
    //this.getComidas();
  }

  async actionSheetDelete(id: number) {
    const actionSheet = await this.actionSheetController.create({
      header: "tem certeza que deseja deletar ?",
      cssClass: "my-custom-class",
      buttons: [
        {
          text: "sim",
          role: "destructive",
          icon: "trash",
          handler: async (): Promise<void> => {
            await this.remover(id);
          },
          //console.log("delete clicked");
        },
        {
          text: "cancelar",
          icon: "close",
          role: "cancel",
          handler: () => {
            console.log("cancel cliked");
          },
        },
      ],
    });
    await actionSheet.present();
  } */
}
