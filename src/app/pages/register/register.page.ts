import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Router } from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  myForm: FormGroup;
  matchingPasswordGroup: any;
  data: any;
  submitted = false;
  db_obj: SQLiteObject;
  public userID:any = [];

  constructor(
    public formBuilder: FormBuilder,
    private sqlite: SQLite,
    private platform: Platform,
    private router: Router,
    private alertController: AlertController
  ) { 
    this.data = {
      name: '',
      email: '',
      password: '',
      phone: '',
      gender: '',
      address: ''
    }

    this.platform.ready().then(() => {
      this.createDB();
    })
    .catch(err => {
      console.log(err);
    })
  }

  /**
   * Create users database.
   * 
   */
   createDB() {
    this.sqlite.create({
      name: 'login.db',
      location: 'default'
    })
    .then((db: SQLiteObject) => {
      this.db_obj = db;
      this.createTable();
      console.log('Database was created.');
    })
    .catch(err => {
      console.log(err);
    })
  }

  /**
   * Create users table. 
   * 
   */
   createTable() {
    console.log('creating table....');
    this.db_obj.executeSql('CREATE TABLE IF NOT EXISTS loginUsers(uid INTEGER PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password VARCHAR(255), gender VARCHAR(255), address VARCHAR(255))', [])
    .then(() => console.log('table was created!'))
    .catch(err => console.log(err));
  }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],
      password_confirmation: ['', Validators.required],
      phone: ['', Validators.pattern('^[0-9]+$')],
      gender: ['', Validators.required],
      address: ['', Validators.maxLength(30)],
    }, {
      validators: this.matchPassword.bind(this)
    });
  }

  /**
   * Check if the password and password confirmation are matched.
   * 
   */
  matchPassword(formGroup: FormGroup) {
    const { value : password } = formGroup.get('password');
    const { value: password_confirmation } = formGroup.get('password_confirmation');
    return password === password_confirmation ? null : { passwordNotMatch : true };
  }

  get errorControl() {
    return this.myForm.controls;
  }

  /**
   * Insert user data into users table.
   * 
   */
  insertDB() {
    this.db_obj.executeSql(`INSERT INTO loginUsers(name, email, password, gender, address) VALUES ('${this.data.name}', '${this.data.email}', '${this.data.password}', '${this.data.gender}', '${this.data.address}')`, [])
    .then(() => {
      console.log('A user was created');
    });
  }

  /**
   * Submit register form.
   * 
   */
  onSubmit() {
    this.submitted = true;
    console.log('---data---', this.myForm.value);
    if(!this.myForm.valid)
    {
      console.log('Form validation failed!');
    }
    else {
      this.data.name = this.myForm.get('name').value;
      this.data.email = this.myForm.get('email').value;
      this.data.password = this.myForm.get('password').value;
      this.data.gender = this.myForm.get('gender').value;
      this.data.address = this.myForm.get('address').value;
      console.log(this.myForm.get('name').value);
      this.insertDB();
      this.selectUserId(this.data.email);
      console.log('---form data---', this.myForm.value);
    }
  }

  registerConfirm(id) {
    console.log('registered user id...', id);
    this.alertController.create({
      header: 'Register Information',
      message: 'You can now login with ID-'+ id,
      buttons: [
        {
          text: 'OK',
          handler: () => this.router.navigate(['home'])
        }
      ]
    })
    .then(alert => {
      alert.present();
    })
  }

  selectUserId(email) {
    this.db_obj.executeSql(`SELECT uid FROM loginUsers WHERE email= '${email}'`, [])
    .then(res => {
      let id = res.rows.item(0).uid;
      this.registerConfirm(id);
    })
  }
}
