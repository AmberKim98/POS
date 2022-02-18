import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database/database.service';
import { EditItemPage } from '../edit-item/edit-item.page';

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

  constructor(
    private platform: Platform,
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
    this.dbService.openPosDB().then((db: SQLiteObject) => {
      this.db_obj = db;
      this.db_obj.executeSql('SELECT * FROM itemlist', [])
      .then((res) => {
        for(var i=0; i<res.rows.length; i++) {
          this.items.push(res.rows.item(i));
          console.log(this.items);
        }
      })
      .catch(err => {
        console.log(err);
      })
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
   * Delete item from items table.
   * 
   */
  deleteItem(item) {
    this.dbService.openPosDB().then((db: SQLiteObject) => {
      this.db_obj = db;
      this.db_obj.executeSql(`DELETE FROM itemlist WHERE id=${item.id}`, [])
      .then(() => {
        window.location.reload();
        console.log('Item was deleted!');
      })
    })
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

  onSubmit() {
    this.submitted = true;
    this.data.barcode = this.myForm.get('barcode').value;
    this.data.name = this.myForm.get('itemName').value;
    this.data.price = this.myForm.get('price').value;

    this.dbService.openPosDB().then((db: SQLiteObject) => {
      this.db_obj = db;
      this.db_obj.executeSql(`SELECT * FROM itemlist WHERE barcode='${this.data.barcode}'`, [])
      .then(res => {
        console.log('if exists...', res.rows.length);
        if(res.rows.length == 0)
        {
          this.db_obj.executeSql(`INSERT INTO itemlist(barcode,name,price) VALUES ('${this.data.barcode}', '${this.data.name}', '${this.data.price}')`, [])
          .then(() => {
            console.log('A new item was added!');
            this.closeModal();
            window.location.reload();
          })
          .catch(err => {
            console.log(err);
          })
        }
        else this.warningAlert();
      })
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
      buttons: ['OK']
    });
    alert.present();
  }

  /**
   * Update item list modal.
   * 
   */
   async updateModal(item) {
    console.log('Item..',item);
    const modal = await this.modalCtrl.create({
      component: EditItemPage,
      componentProps: {
        'id': item.id,
        'barcode': item.barcode,
        'name': item.name,
        'price': item.price
      },
      initialBreakpoint: 0.7,
    });
    return await modal.present();
  }
}
