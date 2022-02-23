import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { DatabaseService } from 'src/app/services/database/database.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-total',
  templateUrl: './total.page.html',
  styleUrls: ['./total.page.scss'],
})
export class TotalPage implements OnInit {
  public today;
  db_obj: SQLiteObject;
  data:any = [];
  cartItems:any = [];
  public total:any;
  public promotion = 0;
  public qst = 340;

  constructor(
    private dbService: DatabaseService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router,
  ) { 
    this.today = Date.now();
  }

  ngOnInit() {
    this.getCartItems();
  }

  /**
   * Get cart items.
   * 
   */
  getCartItems() {
    this.dbService.getCartItems().then((data) => {
      this.data = data;
      for(var i=0; i<this.data.rows.length; i++)
      {
        this.cartItems.push(this.data.rows.item(i));
      }
      console.log(this.cartItems);
      this.calculateTotal();
    }); 
  }

  /**
   * Calculate total amount.
   * 
   */
  calculateTotal() {
    console.log('---calculate total---',this.data);
    let total = 0;
    for(var i=0; i<this.cartItems.length; i++)
    {
      total += this.cartItems[i].price*this.cartItems[i].quantity;
      console.log('total of '+i,total);
    }
    this.total = total;
    console.log('overall total...', this.total);
  }

  /**
   * Save the cart item.
   * 
   */
  async save() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 500
    });
    loading.present();
    loading.onDidDismiss().then(() => {
      this.successAlert();
    });
  }

  /**
   * Show success alert.
   */
  async successAlert() {
    const alert = await this.alertController.create({
      header: 'Successfully saved!',
      message: 'Thank you for your order',
      buttons: [{
        text: 'OK',
        handler: () => this.router.navigate(['home'])
      }]
    });
    alert.present();
  }
}
