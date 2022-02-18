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

  constructor(
    private barcodeScanner: BarcodeScanner,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    private dbService: DatabaseService
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
    this.dbService.openPosDB().then((db: SQLiteObject) => {
      this.db_obj = db;
      this.db_obj.executeSql(`SELECT name,price FROM itemlist WHERE barcode = '${barcode}'`, [])
      .then(res => {
        console.log('barcode result..', res.rows.item(0));
        this.myForm.get('itemName').setValue(res.rows.item(0).name);
        this.myForm.get('price').setValue(res.rows.item(0).price); 
      })
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
  onSubmit() {
    this.dbService.openPosDB().then((db: SQLiteObject) => {
      this.db_obj = db;
      this.db_obj.executeSql(`UPDATE cartItems SET 
      barcode = '${this.myForm.get('barcode').value}', 
      name = '${this.myForm.get('itemName').value}',
      quantity = '${this.myForm.get('quantity').value}',
      price = '${this.myForm.get('price').value}' 
      WHERE id = ${this.id}`, [])
      .then(() => {
        this.dismiss();
        window.location.reload();
        console.log('Item was updated!');
      })
    })
  }

  /**
   * Delete item.
   * 
   */
   deleteItem(id) {
    this.dbService.openPosDB().then((db: SQLiteObject) => {
      this.db_obj = db;
      this.db_obj.executeSql(`DELETE FROM carts WHERE id=${id}`, [])
      .then(() => {
        console.log('An item was deleted.');
        this.dismiss();
        window.location.reload();
      })
      .catch(err => {
        console.log(err);
      })
    })
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
