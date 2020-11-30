import { Component, Input, OnInit } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";
import { FileChooser } from "@ionic-native/file-chooser/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";
import {
  FileTransferObject,
  FileUploadOptions,
  FileTransfer,
} from "@ionic-native/file-transfer/ngx";
import { File } from "@ionic-native/file/ngx";
import {
  ActionSheetController,
  LoadingController,
  ModalController,
  Platform,
} from "@ionic/angular";
import { finalize } from "rxjs/operators";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { Observable } from "rxjs";
import { ChatService } from "src/app/services/chat.service";
import { ModalPerfilUserPage } from "../modal-perfil-user/modal-perfil-user.page";
import { PerfilUser } from "../models/perfilUser";
import {
  DocumentViewer,
  DocumentViewerOptions,
} from "@ionic-native/document-viewer/ngx";

@Component({
  selector: "app-perfil-do-usuario",
  templateUrl: "./perfil-do-usuario.page.html",
  styleUrls: ["./perfil-do-usuario.page.scss"],
})
export class PerfilDoUsuarioPage implements OnInit {
  public referencia;
  public arquivo;

  //tutorial igor remas
  public uploadPercent: Observable<number>;
  public downloadUrl: Observable<string>;

  //salvar arquivos download e upload
  uploadText: any;
  downloadText: any;
  fileTransfer: FileTransferObject;

  //salvar historico do perfil
  public perfilUser: Array<PerfilUser> = [];
  public carregar: any;

  constructor(
    public modalController: ModalController,
    public laoding: LoadingController,
    public chat: ChatService,
    public modal: ModalController,
    public actionSheetController: ActionSheetController,
    private platform: Platform,
    private camera: Camera,
    private sftorage: AngularFireStorage,
    private file: File,
    private transfer: FileTransfer,
    private filePath: FilePath,
    private filechooser: FileChooser,
    private document: DocumentViewer
  ) {
    this.uploadText = "";
    this.downloadText = "";
  }

  ngOnInit() {}

  async showCarregar(): Promise<void> {
    this.carregar = await this.laoding.create({
      message: "Aguarde, processando",
    });
    await this.carregar.present();
  }

  public async getPerfil() {
    await this.showCarregar();
    setTimeout(async () => {
      this.perfilUser = await this.chat.getAll();
      //console.log(this.comidas);
      await this.fecharCarregando();
    }, 2000);
  }

  async fecharCarregando(): Promise<void> {
    await this.carregar.dismiss();
  }

  async abrirModalPerfil() {
    const modal = await this.modalController.create({
      component: ModalPerfilUserPage,
      cssClass: "my-custom-class",
    });
    modal.onDidDismiss().then(async () => {
      await this.getPerfil();
    });
    return await modal.present();
  }

  async editarPerfilUser(id: number): Promise<void> {
    await this.showCarregar();
    const modal = await this.modal.create({
      component: ModalPerfilUserPage,
      componentProps: {
        id,
      },
    });
    modal.onDidDismiss().then(async () => {
      await this.getPerfil();
    });

    await this.fecharCarregando();
    return await modal.present();
  }

  public async remover(id: number): Promise<void> {
    await this.chat.removerItem(id);
    this.getPerfil();
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
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  //download do video que o cara não fala nada -- substituir video por PDF
  uploadFile() {
    this.filechooser.open().then(
      (uri) => {
        this.filePath.resolveNativePath(uri).then(
          (nativepath) => {
            this.fileTransfer = this.transfer.create();
            let options: FileUploadOptions = {
              fileKey: "videofile",
              fileName: "video.mp4",
              chunkedMode: false,
              headers: {},
              mimeType: "video/mp4",
            };
            this.uploadText = "uploading...";
            this.fileTransfer
              .upload(nativepath, "your fara o endpoint api url", options)
              .then(
                (data) => {
                  alert("transfer done= " + JSON.stringify(data));
                  this.uploadText = "";
                },
                (err) => {
                  this.uploadText = "";
                }
              );
          },
          (err) => {
            alert(JSON.stringify(err));
          }
        );
      },
      (err) => {
        alert(JSON.stringify(err));
      }
    );
  }

  abortUpload() {
    this.fileTransfer.abort();
    alert("uploadr cancel");
  }

  downloadFile() {
    this.downloadText = "downloading...";

    this.fileTransfer = this.transfer.create();
    this.fileTransfer
      .download("file url", this.file.externalRootDirectory + "video.mp4")
      .then((data) => {
        alert("download complete.");
        this.downloadText = "";
      });
  }

  abortDownload() {
    this.fileTransfer.abort();
    alert("cancelar download");
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //ADD ARQUIVO no celular igor remas
  async openGalery() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true,
      /* encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE */
    };

    try {
      const fileUri: string = await this.camera.getPicture(options);

      //armazena nome do arquivo
      let file: string;

      if (this.platform.is("android")) {
        file = fileUri.split("/").pop();
      } else {
        file = fileUri.substring(
          fileUri.lastIndexOf("/") + 1,
          fileUri.indexOf("?")
        );
      }
      const path: string = fileUri.substring(0, fileUri.lastIndexOf("/"));

      const buffer: ArrayBuffer = await this.file.readAsArrayBuffer(path, file);
      const blob: Blob = new Blob([buffer], { type: " image/jpeg" });

      this.uploadPicture(blob);
    } catch (error) {
      console.error(error);
    }
  }
  uploadPicture(blob: Blob) {
    //caminho de refrencia no storage
    const ref = this.sftorage.ref("images/ionic.jpg");

    const task = ref.put(blob);

    // se eu não quizer dar feeback eu deleto essa parte
    this.uploadPercent = task.percentageChanges();
    task
      .snapshotChanges()
      .pipe(finalize(() => (this.downloadUrl = ref.getDownloadURL())))
      .subscribe();
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////

  // ADD ARQUIVO NO PC e abri PDF simonn

  openLocalPDF() {
    const options: DocumentViewerOptions = {
      title: "My PDF",
    };

    let path = null;

    if (this.platform.is("ios")) {
      path = this.file.documentsDirectory;
    } else {
      path = this.file.dataDirectory;
    }

    const transfer = this.transfer.create();
    transfer.download("", path + "myfile.pdf").then((entry) => {
      let url = entry.toURL();
      this.document.viewDocument(url, "application/pdf", options);
    });
  }
  downloadPDf() {
    let path = null;

    if (this.platform.is("ios")) {
      path = this.file.documentsDirectory;
    } else {
      path = this.file.dataDirectory;
    }
    const transfer = this.transfer.create();
    transfer.download("", path + "myfile.pdf").then((entry) => {
      let url = entry.toURL();
      this.document.viewDocument(url, "application/pdf", {});
    });
  }
  /////////////////////////////////////////////////////

  //deu certo ao escolher arquivo -- falta enviar
  baixarArquivo(nome: string) {
    let caminho = this.referencia.child("pasta/" + nome);
    caminho.getDownloadURL().then((url) => {
      console.log(url); // AQUI VOCÊ JÁ TEM O ARQUIVO
    });
  }

  atualizaArquivo(event) {
    this.arquivo = event.srcElement.files[0];
  }
  enviarArquivo(dir, arquivo) {
    let caminho = this.referencia.child("dir/" + this.arquivo.name);
    let tarefa = caminho.put(this.arquivo);
    tarefa.on(
      "state_changed",
      (snapshot) => {
        // Acompanha os estados do upload (progresso, pausado,...)
      },
      (error) => {
        // Tratar possíveis erros
      },
      () => {
        // Função de retorno quando o upload estiver completo
        console.log(tarefa.snapshot.downloadURL);
      }
    );
  }
}
