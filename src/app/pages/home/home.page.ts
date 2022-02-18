import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UpdatePage } from '../update/update.page';

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
      this.createCartTable();
      this.createItemTable();
      this.getcartItems();
      console.log('Database was created.');
    })
    .catch(err => {
      console.log(err);
    })
  }

  /**
   * Create cartItems table.
   * 
   */
  createCartTable() {
    this.db_obj.executeSql('CREATE TABLE IF NOT EXISTS cartItems(id INTEGER PRIMARY KEY, barcode VARCHAR(255), name VARCHAR(255), quantity VARCHAR(255), price VARCHAR(255))', [])
    .then(() => {
      console.log('Cart Items table was created!');
    })
    .catch(err => {
      console.log(err);
    })
  }

  /**
   * Create items table.
   * 
   */
   createItemTable() {
    this.db_obj.executeSql('CREATE TABLE IF NOT EXISTS itemlist(id INTEGER PRIMARY KEY, barcode VARCHAR(255), name VARCHAR(255), price VARCHAR(255))', [])
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
      this.retrieve(this.data.barcode);
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
    this.db_obj.executeSql(`SELECT name,price FROM itemlist WHERE barcode = '${barcode}'`, [])
    .then(res => {
      this.data.name = res.rows.item(0).name;
      this.data.price = res.rows.item(0).price;
      console.log('barcode result..', res.rows.item(0));
      console.log(this.data);
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
    window.location.reload();
  }

  /**
   * Insert item data into cartItems table.
   * 
   */
  insertDB() {
    this.db_obj.executeSql(`INSERT INTO cartItems(barcode, name, quantity, price) VALUES ('${this.data.barcode}', '${this.data.itemName}', '${this.data.quantity}', '${this.data.price}')`, [])
    .then(() => {
      console.log('A new item was created!')
    })
    .catch(err => {
      console.log(err);
    })
  }

  /**
   * Get cartItems data from cartItems table.
   * 
   */
  getcartItems() {
    this.db_obj.executeSql('SELECT * FROM cartItems', [])
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
    this.db_obj.executeSql(`DELETE FROM cartItems WHERE id=${item.id}`, [])
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

  /**
   * Update cart items modal.
   * 
   */
  async updateModal(item) {
    console.log('Item..',item);
    const modal = await this.modalCtrl.create({
      component: UpdatePage,
      componentProps: {
        'id': item.id,
        'barcode': item.barcode,
        'name': item.name,
        'quantity': item.quantity,
        'price': item.price
      },
      initialBreakpoint: 0.9,
    });
    return await modal.present();
  }

  /**
   * Clear all items.
   * 
   */
  clearAll() {
    console.log('clearning...');
    this.db_obj.executeSql('DELETE FROM cartItems', [])
    .then(() => {
      console.log('All cart items were cleared!');
      window.location.reload();
    })
    .catch(err => {
      console.log(err);
    })
  }
}
