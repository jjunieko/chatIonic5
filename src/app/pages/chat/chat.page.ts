import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import firebase from "firebase/app";
import {
  ActionSheetController,
  IonContent,
  LoadingController,
  ModalController,
  NavController,
  Platform,
} from "@ionic/angular";
import { Observable } from "rxjs";
import { ChatService, Message } from "src/app/services/chat.service";
import { finalize } from "rxjs/operators";
import { AngularFireStorage } from "@angular/fire/storage";
import { File } from "@ionic-native/file/ngx";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import {
  DocumentViewer,
  DocumentViewerOptions,
} from "@ionic-native/document-viewer/ngx";
import { FileTransfer } from "@ionic-native/file-transfer/ngx";
import { PerfilUser } from "../models/perfilUser";
import { ModalPerfilUserPage } from "../modal-perfil-user/modal-perfil-user.page";

/* import pdfMaker from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMaker.vfs = pdfFonts.pdfMake.vfs; */

@Component({
  selector: "app-chat",
  templateUrl: "./chat.page.html",
  styleUrls: ["./chat.page.scss"],
})
export class ChatPage implements OnInit {
  public referencia;
  public arquivo;

  public uploadPercent: Observable<number>;
  public downloadUrl: Observable<string>;
  @ViewChild(IonContent) content: IonContent;

  messages: Observable<Message[]>;
  newMsg = "";

  public carregar: any;
  public perfilParaChat: Array<PerfilUser> = [];

  // pdfObj = null;

  constructor(
    private chatService: ChatService,
    private router: Router,
    private camera: Camera,
    private platform: Platform,
    private file: File,
    private sftorage: AngularFireStorage,

    private fileOpener: FileOpener,

    public navCtlr: NavController,
    private document: DocumentViewer,
    private transfer: FileTransfer,

    public modalController: ModalController,
    // public comida: ComidaService --- adicionar um service ou chat.service
    public laoding: LoadingController,
    public actionSheetController: ActionSheetController
  ) {}

  async ngOnInit() {
    //this.messages = this.chatService.getChatMessages();
  }

  sendMessage() {
    this.chatService.addChatMessage(this.newMsg).then(() => {
      this.newMsg = "";
      this.content.scrollToBottom();
    });
  }
  signOut() {
    this.chatService.signOut().then(() => {
      this.router.navigateByUrl("/", { replaceUrl: true });
    });
  }

  /*  //deu certo ao escolher arquivo -- falta enviar
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
  } */

  //ADD ARQUIVO no celular
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

      if (this.platform.is("ios")) {
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

  // ADD ARQUIVO NO PC e abri PDF

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
  /*   opengaleryPC() {
    this.fileOpener
      .open("path/to/file.pdf", "application/pdf")
      .then(() => console.log("File is opened"))
      .catch((e) => console.log("Error opening file", e));

    this.fileOpener
      .showOpenWithDialog("path/to/file.pdf", "application/pdf")
      .then(() => console.log("File is opened"))
      .catch((e) => console.log("Error opening file", e));
  } */

  // gerar pdf e copiar e baixar

  /*  downloadPdf() {
    if (this.plt.is("cordova")) {
      this.pdfObj.getBuffer((buffer) => {
        var utf8 = new Uint8Array(buffer);
        var binaryArray = utf8.buffer;
        var blob = new Blob([binaryArray], { type: "application/pdf" });

        this.file
          .writeFile(this.file.dataDirectory, "myletter", blob, {
            replace: true,
          })
          .then((fileEntry) => {
            this.fileOpener.open(
              this.file.dataDirectory + "myletter.pdf",
              "application/pdf"
            );
          });
      });
    } else {
      this.pdfObj.download();
    }
  } */

  // ABRIR MODAL E SALVAR ITENS

  async abrirModalPerfil() {
    const modal = await this.modalController.create({
      component: ModalPerfilUserPage,
      cssClass: "my-custom-class",
    });
    return await modal.present();
  }
}

/*   async ngOnInit(): Promise<void> {
    await this.getDadosPerfilChat();
  } */
/* 
  async showCarregar(): Promise<void> {
    this.carregar = await this.laoding.create({
      message: "Aguarde, processando",
    });
    await this.carregar.present();
  }

  async abrirModalComida(): Promise<void> {
    const modal = await this.modal.create({
      component: ModalPerfilUserPage,
    });
    modal.onDidDismiss().then(async () => {
      await this.getComidas();
    });
    return await modal.present();
  }

  async editarComida(id: number): Promise<void> {
    await this.showCarregar();
    const modal = await this.modal.create({
      component: ModalPerfilUserPage,
      componentProps: {
        id,
      },
    });
    modal.onDidDismiss().then(async () => {
      await this.getComidas();
    });

    await this.fecharCarregando();
    return await modal.present();
  }

   public async getComidas() {
    await this.showCarregar();
    setTimeout(async () => {
      this.perfilParaChat = await this.perfilParaChat.getAll(); //colocar um service
      //console.log(this.comidas);
      await this.fecharCarregando();
    }, 2000);
  }

  public async remover(id: number): Promise<void> {
    await this.comida.remover(id);
    this.getComidas();
  } 

  async fecharCarregando(): Promise<void> {
    await this.carregar.dismiss();
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
