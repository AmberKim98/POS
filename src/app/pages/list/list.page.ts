import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database/database.service';
import { UpdatePage } from '../update/update.page';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  items:any = [];
  data:any = [];
  db_obj: SQLiteObject;
  row_data:any = [];
  submitted = false;
  myForm: FormGroup;
  public itemUpdate;
  public cartUpdate;

  constructor(
    private platform: Platform,
    private loadingController: LoadingController,
    private dbService: DatabaseService,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private barcodeScanner: BarcodeScanner,
    private alertController: AlertController
  ) { 
    this.data = {
      barcode: '',
      itemName: '',
      quantity: '',
      price: ''
    }
  }

  ngOnInit() {
    this.getItems();

    this.myForm = this.formBuilder.group({
      barcode: ['', Validators.required],
      itemName: ['', Validators.required],
      quantity: ['', Validators.required],
      price: ['', Validators.required]
    })
  }

  /**
   * Get item list.
   * 
   */
  getItems() {
    this.dbService.getItems().then((res) => {
      this.data = res;
      for(var i=0; i<this.data.rows.length; i++) {
        this.items.push(this.data.rows.item(i));
      }
      console.log('getting items...',this.items);
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
   * Show confirm alert.
   * 
   */
   async confirmAlert(id) {
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
   * Delete item from items table.
   * 
   */
  deleteItem(id) {
    console.log(id);
    this.dbService.deleteItem(id).then(() => {
      console.log('item was deleted');
    })
    .catch(err => {
      console.log(err);
    });
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
   * Dismiss modal box.
   * 
   */
   closeModal() {
    this.modalCtrl.dismiss();
  }

  async onSubmit() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 500
    });
    loading.present();
    this.submitted = true;
    this.data.barcode = this.myForm.get('barcode').value;
    this.data.name = this.myForm.get('itemName').value;
    this.data.price = this.myForm.get('price').value;

    this.dbService.checkIfExisted(this.data.barcode).then((res) => {
      this.row_data = res;
      console.log(this.row_data.rows.item(0));
      if(this.row_data.rows.length == 0) {
        this.dbService.addNewItem(this.data).then((res) => {
          this.data = res;
          console.log('this item',this.data.rows.item(0));
          let item = {
            id: this.data.rows.item(0).id,
            barcode: this.data.rows.item(0).barcode,
            name: this.data.rows.item(0).name,
            price: this.data.rows.item(0).price
          }
          console.log('---item---', item);
          // window.location.reload();
          this.items.push(item); 
          this.closeModal();
          console.log('after adding...', this.items);
        })
      }
      else {
        loading.dismiss().then(() => {
          this.warningAlert();
        })
      }
    })
  }

  /**
   * Warning alert for adding existed item.
   * 
   */
  async warningAlert() {
    const alert = await this.alertController.create({
      header: 'Adding item failed!',
      message: 'The item you are trying to add is already existed.',
      buttons: [
        {
          text: 'OK',
          handler: () => this.closeModal()
        }
      ],
    });
    alert.present();
  }

  /**
   * Update cart items modal.
   * 
   */
   async updateModal(item) {
    this.cartUpdate = false;
    this.itemUpdate = true;
    console.log('Item..',item);
    const modal = await this.modalCtrl.create({
      component: UpdatePage,
      componentProps: {
        'id': item.id,
        'barcode': item.barcode,
        'name': item.name,
        'price': item.price,
        'cartUpdate': this.cartUpdate,
        'itemUpdate': this.itemUpdate 
      },
      initialBreakpoint: 0.9,
    });
    return await modal.present();
  }
}
