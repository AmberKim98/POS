import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, Platform, IonRouterOutlet } from '@ionic/angular';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UpdatePage } from '../update/update.page';
import { DatabaseService } from 'src/app/services/database/database.service';
import  { Router } from '@angular/router';

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
  public itemUpdate;
  public cartUpdate;
  cartItems:any = [];
  items: any = [];
  retrieveBarcodeData: boolean;

  constructor(
    private modalCtrl: ModalController,
    private barcodeScanner: BarcodeScanner,
    private sqlite: SQLite,
    public formBuilder: FormBuilder,
    private platform: Platform,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private dbService: DatabaseService,
    private router: Router
  ) {
    this.data = {
      barcode: '',
      itemName: '',
      quantity: '',
      price: ''
    }

    this.platform.ready().then(() => {
      this.dbService.getCartItems().then(res => {
        this.cartItems = res;
        for(var i=0; i<this.cartItems.rows.length; i++)
        {
          this.row_data.push(this.cartItems.rows.item(i));
        }
        console.log(this.row_data);
      })
    })
    this.createCartTable();
    this.createItemTable();
   }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      barcode: ['', Validators.required],
      itemName: ['', Validators.required],
      quantity: ['', Validators.required],
      price: ['', Validators.required]
    })
  }

  addBtn() {
    console.log('clicked add item btn');
  }

  /**
   * Error controls.
   * 
   */
  get errorControl() {
    return this.myForm.controls;
  }

  /**
   * Create cartItems table.
   * 
   */
  createCartTable() {
    this.dbService.createCartTable();
  }

  /**
   * Create items table.
   * 
   */
   createItemTable() {
    this.dbService.createItemTable();
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
    this.dbService.retrieve(barcode).then(data => {
      this.items = data;
      if(this.items.rows.length == 0) 
      {
        console.log('no data');
      }
      else {
        this.data.itemName = this.items.rows.item(0).name;
        this.data.price = this.items.rows.item(0).price;
      }
      console.log('barcode result..', this.items.rows.item(0));
      console.log(this.data);
    })
  }

  /**
   * Submit new item addition form.
   * 
   */
  onSubmit() {
    this.submitted = true;
    this.myForm.get('barcode').clearValidators();
    this.myForm.get('itemName').clearValidators();
    this.myForm.get('quantity').clearValidators();
    this.myForm.get('price').clearValidators();
    this.data.barcode = this.myForm.get('barcode').value;
    this.data.itemName = this.myForm.get('itemName').value;
    this.data.quantity = this.myForm.get('quantity').value;
    this.data.price = this.myForm.get('price').value;
    console.log(this.data);

    if(this.items.rows.length == 0) {
      console.log('inserting new item...');
      this.dbService.addNewItem(this.data).then(res => {
        console.log(res);
      })
    }
    console.log('inserting new cart item...');
    this.insertDB();
    this.myForm.reset();
    this.dismiss();
  }

  /**
   * Insert item data into cartItems table.
   * 
   */
  async insertDB() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 500
    });
    loading.present();
    console.log('before adding...', this.row_data);
    this.dbService.addNewCartItem(this.data).then((res) => {
      this.items = res;
      console.log('this item',this.items.rows.item(0));
        let item = {
          id: this.items.rows.item(0).id,
          barcode: this.items.rows.item(0).barcode,
          name: this.items.rows.item(0).name,
          quantity: this.items.rows.item(0).quantity,
          price: this.items.rows.item(0).price
        }
        this.row_data.push(item); 
        console.log('after adding...', this.row_data);
    });
  }

  /**
   * Dismiss modal box.
   * 
   */
   dismiss() {
    this.modalCtrl.dismiss();
  }

  /**
   * Delete item.
   * 
   */
  deleteItem(id) {
    console.log(id);
    this.dbService.deleteCartItem(id).then(() => {
      console.log('item was deleted');
    })
    .catch(err => {
      console.log(err);
    });
  }

  /**
   * Show confirm alert.
   * 
   */
  async confirmAlert(id) {
    console.log('---ID---',id);
    const alert = await this.alertController.create({
      header: 'Are you sure you want to delete',
      buttons: [
        {
          text: 'Sure',
          handler: () => {
            this.deleteItem(id);
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
    this.cartUpdate = true;
    this.itemUpdate = false;
    console.log('Item..',item);
    const modal = await this.modalCtrl.create({
      component: UpdatePage,
      componentProps: {
        'id': item.id,
        'barcode': item.barcode,
        'name': item.name,
        'quantity': item.quantity,
        'price': item.price,
        'cartUpdate': this.cartUpdate,
        'itemUpdate': this.itemUpdate 
      },
      initialBreakpoint: 0.9,
    });
    return await modal.present();
  }

  /**
   * Clear all items.
   * 
   */
  async clearAll() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 500
    });
    loading.present();
    this.dbService.clearAllCarts();
  }

  /**
   * Logout and navigate to home page.
   * 
   */
  async logout() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 500,
    });
    loading.present();
    loading.onDidDismiss().then(() => {
      this.router.navigate(['login']);
    })
  }
}
