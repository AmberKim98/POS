import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database/database.service';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
})
export class UpdatePage implements OnInit {
  db_obj:SQLiteObject;
  row_data:any = [];
  data:any = [];
  myForm: FormGroup;
  submitted = false;
  @Input() id: number;
  @Input() barcode: string;
  @Input() name: string;
  @Input() quantity: string;
  @Input() price: string;
  @Input() cartUpdate: boolean;
  @Input() itemUpdate: boolean;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    private dbService: DatabaseService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      barcode: this.barcode,
      itemName: this.name,
      quantity: this.quantity,
      price: this.price
    })
  }

  /**
   * Scan barcode of item.
   * 
   */
   scan() {
    this.barcodeScanner.scan().then(barcodeData => {
      this.myForm.get('barcode').setValue(barcodeData["text"]);
      this.retrieve(this.myForm.get('barcode').value);
      console.log(barcodeData);
    })
    .catch(err => {
      console.log(err);
    })
  }

  /**
   * Retrieve name and price for specific barcode.
   * 
   */
   retrieve(barcode) {
    console.log('hello...');
    this.dbService.retrieve(barcode).then(data => {
      this.data = data;
      this.myForm.get('itemName').setValue(this.data.rows.item(0).name);
      this.myForm.get('price').setValue(this.data.rows.item(0).price); 
    })
  }

  /**
   * Dismiss modal box.
   * 
   */
   dismiss() {
    this.modalCtrl.dismiss();
  }

  /**
   * Update cart item.
   * 
   */
  async onSubmit() {
    console.log('submitting form...');
    console.log(this.myForm);
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 500
    });
    loading.present();
    console.log(this.myForm, this.id, this.cartUpdate, this.itemUpdate);
    this.dbService.update(this.myForm, this.id, this.cartUpdate, this.itemUpdate);
    this.dismiss();
  }

  /**
   * Delete item.
   * 
   */
   deleteItem(id) {
     if(this.cartUpdate == true) {
      this.dbService.deleteCartItem(id).then(() => {
        console.log('A cart item was deleted.');
      });
     }
     else {
      this.dbService.deleteItem(id).then(() => {
        console.log('An item was deleted.');
      });
     }
  }

  /**
   * Show confirm alert.
   * 
   */
  async confirmAlert() {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to delete',
      buttons: [
        {
          text: 'Sure',
          handler: () => {
            this.deleteItem(this.id);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    alert.present();
  }
}
