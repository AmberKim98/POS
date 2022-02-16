import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  db_obj:SQLiteObject;
  row_data:any = [];
  data:any = [];
  myForm: FormGroup;
  submitted = false;

  constructor(
    private modalCtrl: ModalController,
    private barcodeScanner: BarcodeScanner,
    private sqlite: SQLite,
    public formBuilder: FormBuilder,
    private platform: Platform,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    this.data = {
      barcode: '',
      itemName: '',
      quantity: '',
      price: ''
    }

    this.platform.ready().then(() => {
      this.createDB();
    })
   }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      barcode: ['', Validators.required],
      itemName: ['', Validators.required],
      quantity: ['', Validators.required],
      price: ['', Validators.required]
    })
  }

  /**
   * Error controls.
   * 
   */
  get errorControl() {
    return this.myForm.controls;
  }

  /**
   * Create database.
   *  
   */
  createDB() {
    this.sqlite.create({
      name: 'pos.db',
      location: 'default'
    })
    .then((db: SQLiteObject) => {
      this.db_obj = db;
      this.createTable();
      this.getItems();
      console.log('Database was created.');
    })
    .catch(err => {
      console.log(err);
    })
  }

  /**
   * Create items table.
   * 
   */
  createTable() {
    this.db_obj.executeSql('CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY, barcode VARCHAR(255), name VARCHAR(255), quantity VARCHAR(255), price VARCHAR(255))', [])
    .then(() => {
      console.log('Items table was created!');
    })
    .catch(err => {
      console.log(err);
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
   * Scan barcode of item.
   * 
   */
  scan() {
    this.barcodeScanner.scan().then(barcodeData => {
      this.data.barcode = barcodeData["text"];
      console.log(barcodeData);
    })
    .catch(err => {
      console.log(err);
    })
  }

  /**
   * Submit new item addition form.
   * 
   */
  async onSubmit() {
    const loading = await this.loadingController.create();
    this.submitted = true;
    this.data.itemName = this.myForm.get('itemName').value;
    this.data.quantity = this.myForm.get('quantity').value;
    this.data.price = this.myForm.get('price').value;
    await loading.present();
    this.insertDB();
    loading.dismiss();
    this.dismiss();
  }

  /**
   * Insert item data into items table.
   * 
   */
  insertDB() {
    this.db_obj.executeSql(`INSERT INTO items(barcode, name, quantity, price) VALUES ('${this.data.barcode}', '${this.data.itemName}', '${this.data.quantity}', '${this.data.price}')`, [])
    .then(() => {
      console.log('A new item was created!')
    })
    .catch(err => {
      console.log(err);
    })
  }

  /**
   * Get items data from items table.
   * 
   */
  getItems() {
    this.db_obj.executeSql('SELECT * FROM items', [])
    .then((res) => {
      for(var i=0; i<res.rows.length; i++)
      {
        this.row_data.push(res.rows.item(i));
      }
      console.log(this.row_data);
    })
  }

  /**
   * Delete item.
   * 
   */
  deleteItem(item) {
    this.db_obj.executeSql(`DELETE FROM items WHERE id=${item.id}`, [])
    .then(() => {
      console.log('An item was deleted.');
      window.location.reload();
    })
    .catch(err => {
      console.log(err);
    })
  }

  /**
   * Show confirm alert.
   * 
   */
  async confirmAlert(item) {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to delete',
      buttons: [
        {
          text: 'Sure',
          handler: () => {
            this.deleteItem(item);
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
