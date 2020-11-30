import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
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

/* import { AngularFireStorage } from "@angular/fire/storage";
import { File } from "@ionic-native/file/ngx";
import { FileChooser } from "@ionic-native/file-chooser/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import {
  DocumentViewer,
  DocumentViewerOptions,
} from "@ionic-native/document-viewer/ngx";
import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject,
} from "@ionic-native/file-transfer/ngx"; */
import { PerfilUser } from "../models/perfilUser";
import { Storage } from "@ionic/storage";

/* import pdfMaker from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMaker.vfs = pdfFonts.pdfMake.vfs; */

@Component({
  selector: "app-chat",
  templateUrl: "./chat.page.html",
  styleUrls: ["./chat.page.scss"],
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  messages: Observable<Message[]>;
  newMsg = "";

  public carregar: any;
  public perfilParaChat: Array<PerfilUser> = [];

  // pdfObj = null;

  constructor(
    private chatService: ChatService,
    private router: Router,
    /*    private platform: Platform,
    private file: File,
    private sftorage: AngularFireStorage,

    private fileOpener: FileOpener, */

    public navCtlr: NavController,
    /*     private document: DocumentViewer,
    private transfer: FileTransfer,
    private filePath: FilePath,
    private filechooser: FileChooser, */

    public modalController: ModalController,
    public laoding: LoadingController,
    public actionSheetController: ActionSheetController,
    public storage: Storage
  ) {}

  async ngOnInit() {
    //inclui as mensagens no chat.
    this.messages = this.chatService.getChatMessages();
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

  //////////////////////////////////////////////////////////////////////
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
}
