import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database/database.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  users: any=[];
  loginForm: FormGroup;

  constructor(
    private dbService: DatabaseService,
    private platform: Platform,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController
  ) { 
    this.platform.ready().then(() => {
      this.dbService.createUserTable().then(() => {
        this.dbService.select().then(res => {
        this.users = res;
        console.log(this.users);
      })
      });
      // this.dbService.select().then(res => {
      //   this.users = res;
      //   console.log(this.users);
      // })
    })
  } 

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      userID: ['', [Validators.required]]
    })
  }

  /**
   * Login to homepage.
   * 
   */
  async onSubmit() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 500
    });
    let flag = false;
    for(var i=0; i<this.users.length; i++)
    {
      if(this.loginForm.get('userID').value == this.users[i].uid)
      {
        flag = true;
        break;
      }
    }
    if(flag == true)
    {
      loading.present();
      loading.onDidDismiss().then(() => {
        this.successAlert();
        this.router.navigate(['/home']);
      })
    }
    else {
      loading.present();
      loading.onDidDismiss().then(() => {
        this.failAlert();
        this.router.navigate(['']);
      })
    }
  }

  /**
   * Show login successful alert.
   * 
   */
  async successAlert()
  {
    const alert = await this.alertController.create({
      header: 'Login Successful!',
    })
    alert.present();
  }

  /**
   * Show login failed alert.
   * 
   */
  async failAlert()
  {
    let id = this.loginForm.get('userID').value;
    const alert = await this.alertController.create({
      header: "Login Failed",
      subHeader: "User with ID-" + id + " does not exist!",
      buttons: ['OK'],
    });
    alert.present();
  }

  /**
   * Set null to id input field after leaving login form. 
   * 
   */
  ionViewWillLeave() {
    this.loginForm.get('userID').setValue("");
  }
}

