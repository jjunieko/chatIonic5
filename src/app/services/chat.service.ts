import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import firebase from "firebase/app"; // resolvi o bug com importação firebase na versão 8
import { Observable } from "rxjs";

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

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
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

  // salvar dados do prontuario do Usuario
  public async salvarComida(
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
    let comidas = await this.getUsers();
    if (!comidas) {
      comidas = [];
    }
    comidas.push(comida);
    await this.storage.set("comidas", JSON.stringify(comidas));
  }

  public async update(comidaForm: PerfilUser, id: number): Promise<void> {
    //comidaForm={Ovos} | id={2}
    let comidas = await this.getUsers();
    comidas = await comidas.map((comidalocalStorage, key) => {
      if (id == key) {
        return comidaForm;
      }
      return comidalocalStorage;
    });

    // ComidasAtualizadas = [1 - pizza, 2 - ovos, 3 - batata]
    await this.storage.set("comidas", JSON.stringify(comidas));
  }
}

// falta organizar salvar a modal e organizar o chat.
//adicionar login em vez de cadastrar
//incluir perfil nas conversar
//listar segurança no banco de dados
