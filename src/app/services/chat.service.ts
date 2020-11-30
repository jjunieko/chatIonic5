import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import firebase from "firebase/app"; // resolvi o bug com importação firebase na versão 8
import { Observable } from "rxjs";
import { Storage } from "@ionic/storage";

import { switchMap, map } from "rxjs/operators";
import { PerfilUser } from "../pages/models/perfilUser";

export interface User {
  uid: string;
  email: string;
}

export interface Message {
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
  createdAt: firebase.firestore.FieldValue;
}

@Injectable({
  providedIn: "root",
})
export class ChatService {
  currentUser: User = null;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    public storage: Storage
  ) {
    this.afAuth.onAuthStateChanged((user) => {
      console.log("Changed: ", user);
      this.currentUser = user;
    });
  }

  //cria login no firebase
  async signUp({ email, password }) {
    const credential = await this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );
    console.log("result: ", credential);
    const uid = credential.user.uid;

    return this.afs.doc(`users/ ${uid}`).set({
      uid,
      email: credential.user.email,
    });
  }

  // loga o usuario na sua conta
  async singIn({ email, password }) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  //sai do bate papo
  async signOut() {
    return this.afAuth.signOut();
  }

  //adiciona msg
  addChatMessage(msg) {
    return this.afs.collection("messages").add({
      msg,
      from: this.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  //lista as conversas do chat
  getChatMessages() {
    let users = [];

    return this.getUsers().pipe(
      switchMap((res) => {
        users = res;
        console.log("all users", users);
        return this.afs
          .collection("messages", (ref) => ref.orderBy("createdAt"))
          .valueChanges({ idField: "id" }) as Observable<Message[]>;
      }),
      map((messages) => {
        for (let m of messages) {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser.uid === m.from;
        }
        console.log("all messages: ", messages);
        return messages;
      })
    );
  }

  getUsers() {
    return this.afs
      .collection("users")
      .valueChanges({ idField: "uid" }) as Observable<User[]>;
  }

  // aqui pega o id do usuario e lista na conversa para saber quem é.
  getUserForMsg(msgFromId, users: User[]): string {
    for (let usr of users) {
      if (usr.uid == msgFromId) {
        return usr.email;
      }
    }
    return "users";
  }

  //SALVAR STORAGE
  // salvar dados do prontuario do Usuario

  public async getAll(): Promise<PerfilUser[]> {
    let perfilUser = await this.storage.get("perfilUser");
    perfilUser = JSON.parse(perfilUser);
    return perfilUser;
  }

  public async salvarProntuarioPerfil(
    PerfilPront: PerfilUser,
    id: number
  ): Promise<void> {
    console.log(PerfilPront, id);
    if (id || id === 0) {
      await this.update(PerfilPront, id);
      return;
    }
    await this.save(PerfilPront);
  }

  public async save(PerfilPront): Promise<void> {
    let perfilUser = await this.getAll();
    if (!perfilUser) {
      perfilUser = [];
    }
    perfilUser.push(PerfilPront);
    await this.storage.set("perfilUser", JSON.stringify(perfilUser));
  }

  public async update(perfilUserForm: PerfilUser, id: number): Promise<void> {
    //comidaForm={Ovos} | id={2}
    let comidas = await this.getAll();
    comidas = await comidas.map((perfilLocalStorage, key) => {
      if (id == key) {
        return perfilUserForm;
      }
      return perfilLocalStorage;
    });

    // ComidasAtualizadas = [1 - pizza, 2 - ovos, 3 - batata]
    await this.storage.set("perfilUser", JSON.stringify(comidas));
  }

  public async getUsersForm(key: number): Promise<PerfilUser> {
    let perfilUser = await this.getAll();
    const perfilUserProcurada = perfilUser.find((perfil, idC) => {
      if (idC === key) {
        return perfil;
      }
    });
    return perfilUserProcurada;
  }

  public async removerItem(index: number): Promise<void> {
    let perfilUser = await this.getAll();
    console.log(perfilUser);
    perfilUser.splice(index, 1);
    await this.storage.set("perfilUser", JSON.stringify(perfilUser));
    console.log(perfilUser);
  }
}

//falta organizar salvar a modal e organizar o chat.
//falta fazer um metodo crud para salvar o prontuario e formulário do
//paciente e arrumar o users do chat e decidir qual tipo de upload fazer
//adicionar login em vez de cadastrar
//incluir pagina e salvar nessa pagina dados do usuario -> ok

//listar segurança no banco de dados
//ajustar pdf para subir no chat - ok

//identifiquei o que esta salvando - ok
