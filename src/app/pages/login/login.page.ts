import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AlertController, LoadingController } from "@ionic/angular";
import { ChatService } from "src/app/services/chat.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit {
  public credentialForm: FormGroup;

  constructor(
    public fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private chatService: ChatService
  ) {
    this.credentialForm = fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {}

  async signUp() {
    const loading = await this.loadingController.create();
    await loading.present();
    //console.log("estou aqui");

    this.chatService.signUp(this.credentialForm.value).then(
      (user) => {
        loading.dismiss();
        this.router.navigateByUrl("/chat", { replaceUrl: true });
      },
      async (err) => {
        const alert = await this.alertController.create({
          header: "login falhou",
          message: err.message,
          buttons: ["OK"],
        });

        await alert.present();
      }
    );
  }

  //facil acesso para formulario e campos no formGroup
  get email() {
    return this.credentialForm.get("email");
  }
  get password() {
    return this.credentialForm.get("password");
  }
}
