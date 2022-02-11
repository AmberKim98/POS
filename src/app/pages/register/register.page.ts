import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PasswordValidator } from 'src/app/validators/passwordValidator';

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

  constructor(public formBuilder: FormBuilder) { 
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

  matchPassword(formGroup: FormGroup) {
    const { value : password } = formGroup.get('password');
    const { value: password_confirmation } = formGroup.get('password_confirmation');
    return password === password_confirmation ? null : { passwordNotMatch : true };
  }

  get errorControl() {
    return this.myForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    console.log('---data---', this.myForm.value);
    if(!this.myForm.valid)
    {
      console.log('Form validation failed!');
    }
    else {
      console.log('---form data---', this.myForm.value);
    }
  }
}
