import { Injectable, OnInit } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { LoadingController, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService implements OnInit{

  public db_obj: SQLiteObject;
  public lastItemId;
  public lastCartItemId;
  data:any = [];

  constructor(
    private sqlite: SQLite,
    private loadingController: LoadingController,
    private platform: Platform
  ) {}

  ngOnInit() {
  }

  /**
   * Open login database.
   * 
   */
  open() {
    return this.sqlite.create({
      name: 'login.db',
      location: 'default'
    });
  }

  /**
   * Open POS database.
   * 
   */
  openPosDB() {
    return this.sqlite.create({
      name: 'pos.db',
      location: 'default'
    })
  }

  /**
   * Select users from users table.
   * 
   */
  select() {
    return new Promise((resolve,reject) => {
      this.open().then((dbObj) => {
        dbObj.executeSql('SELECT uid,email,password FROM loginUsers', [])
        .then((data) => {
          if(data.rows.length == 0) {
            dbObj.executeSql(`INSERT INTO loginUsers(uid, name, email, password, gender, address) VALUES (1, 'tester', 'tester@gmail.com', '123456', 'male', 'ygn')`, [])
            .then((res) => {
              console.log(res.insertId);
              dbObj.executeSql(`SELECT * FROM loginUsers WHERE uid = ${res.insertId}`, [])
              .then(res => {
                console.log('---info---', res.rows.item(0));
                let user = {
                  uid: res.rows.item(0).uid,
                  name: res.rows.item(0).name,
                  email: res.rows.item(0).email,
                  password: res.rows.item(0).password,
                  gender: res.rows.item(0).gender,
                  address: res.rows.item(0).address
                }
                this.data.push(user);
                console.log('A new user was inserted!', this.data);
              })
            })
            .catch(err => {
              console.log(err);
            });
          }
          console.log(data.rows.length);
          for(var i=0; i<data.rows.length; i++)
          {
            this.data.push(data.rows.item(i));
          }
          console.log('---data---', this.data);
          resolve(this.data);
        })
      });
    })
  }

  /**
   * Create users table if not exists.
   * 
   */
  createUserTable() {
    return this.open().then((db: SQLiteObject) => {
      this.db_obj = db;
      this.db_obj.executeSql('CREATE TABLE IF NOT EXISTS loginUsers(uid INTEGER PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password VARCHAR(255), gender VARCHAR(255), address VARCHAR(255))', [])
      .then((res) => {
        console.log('User table was created.');
      })
    })
  }

  /**
   * Get items from itemlist table.
   * 
   */
  getItems() {
    return new Promise((resolve, reject) => {
      this.openPosDB().then((dbObj) => {
        dbObj.executeSql('SELECT * FROM itemlist', [])
        .then(data => {
          console.log(data);
          resolve(data);
        })
      })
    })
  }

  /**
   * Get cart items from cartItems table.
   * 
   */
  getCartItems() {
    return new Promise((resolve, reject) => {
      this.openPosDB().then((dbObj) => {
        dbObj.executeSql('SELECT * FROM cartItems', [])
        .then(data => {
          console.log('db service....',data);
          resolve(data);
        })
      })
    })
  }

  /**
   * Retrieve barcode data.
   * 
   */
   retrieve(barcode) {
    return new Promise((resolve, reject) => {
      this.openPosDB().then((db: SQLiteObject) => {
        this.db_obj = db;
        this.db_obj.executeSql(`SELECT name,price FROM itemlist WHERE barcode = '${barcode}'`, [])
        .then(res => {
          resolve(res);
        });
      })
    })
  }

  /**
   * Create cartItems table.
   * 
   */
   createCartTable() {
    this.openPosDB().then((db: SQLiteObject) => {
      this.db_obj = db;
      this.db_obj.executeSql('CREATE TABLE IF NOT EXISTS cartItems(id INTEGER PRIMARY KEY, barcode VARCHAR(255), name VARCHAR(255), quantity VARCHAR(255), price VARCHAR(255))', [])
      .then(() => {
        console.log('Cart Items table was created!');
      })
      .catch(err => {
        console.log(err);
      })
    })
  }

  /**
   * Create items table.
   * 
   */
   createItemTable() {
    this.openPosDB().then((db: SQLiteObject) => {
      this.db_obj = db;
      this.db_obj.executeSql('CREATE TABLE IF NOT EXISTS itemlist(id INTEGER PRIMARY KEY, barcode VARCHAR(255), name VARCHAR(255), price VARCHAR(255))', [])
      .then(() => {
        console.log('Items table was created!');
      })
      .catch(err => {
        console.log(err);
      })
    })
  }

  /**
   * Add new cart item.
   * 
   */
  addNewCartItem(data) {
    return new Promise((resolve, reject) => {
      this.openPosDB().then((db: SQLiteObject) => {
        this.db_obj = db;
        this.db_obj.executeSql(`INSERT INTO cartItems(barcode, name, quantity, price) VALUES ('${data.barcode}', '${data.itemName}', '${data.quantity}', '${data.price}')`, [])
        .then((res) => {
          this.db_obj.executeSql(`SELECT * FROM cartItems WHERE id=${res.insertId}`, [])
          .then(data => {
            resolve(data);
            console.log(data);
          })
        })
      })
    })
  }

  /**
   * Add new item.
   * 
   */
  addNewItem(data) {
    return new Promise((resolve, reject) => {
      this.openPosDB().then((db: SQLiteObject) => {
        this.db_obj = db;
        this.db_obj.executeSql(`INSERT INTO itemlist(barcode,name,price) VALUES ('${data.barcode}', '${data.name}', '${data.price}')`, [])
        .then(res => {
          this.db_obj.executeSql(`SELECT * FROM itemlist WHERE id=${res.insertId}`, [])
          .then(data => {
            resolve(data);
            console.log(data);
          })
        })
      })
    })
  }

  /**
   * Check if the item is already existed.
   * 
   */
  checkIfExisted(barcode) {
    return new Promise((resolve, reject) => {
      this.openPosDB().then((db: SQLiteObject) => {
        this.db_obj = db;
        this.db_obj.executeSql(`SELECT * FROM itemlist WHERE barcode='${barcode}'`, [])
        .then((res) => {
          resolve(res);
          console.log(res);
        })
      })
    })
  }

  /**
   * Update cart item.
   * 
   */
  update(myForm, id, cartUpdate, itemUpdate) {
    console.log('Update info---', myForm, id, cartUpdate, itemUpdate);
    this.openPosDB().then((db: SQLiteObject) => {
      this.db_obj = db;
      if(cartUpdate == true)
      {
        this.updateCartItem(myForm, id, cartUpdate, itemUpdate);
      }
      else {
        console.log('this is updating item...');
        this.db_obj.executeSql(`UPDATE itemlist SET 
        barcode = '${myForm.get('barcode').value}', 
        name = '${myForm.get('itemName').value}',
        price = '${myForm.get('price').value}' 
        WHERE id = ${id}`, [])
        .then(() => {
          this.updateCartItem(myForm, id, cartUpdate, itemUpdate);
          // this.dismiss();
          // window.location.reload();
          // console.log('Item was updated!');
        })    
      }
    })
  }

  /**
   * Update cart item.
   * 
   */
   updateCartItem(myForm, id, cartUpdate, itemUpdate) {
    console.log('updating cart...');
    console.log(myForm, id);
    if(cartUpdate == true)
    {
      this.openPosDB().then((db:SQLiteObject) => {
        this.db_obj = db;
        this.db_obj.executeSql(`UPDATE cartItems SET 
        barcode = '${myForm.get('barcode').value}', 
        name = '${myForm.get('itemName').value}',
        quantity = '${myForm.get('quantity').value}',
        price = '${myForm.get('price').value}' 
        WHERE id = ${id}`, [])
        .then(() => {
          window.location.reload();
          console.log('Cart Item was updated!');
        })
      })
    }
    else {
      this.openPosDB().then((db:SQLiteObject) => {
        this.db_obj = db;
        this.db_obj.executeSql(`UPDATE cartItems SET 
        name = '${myForm.get('itemName').value}',
        price = '${myForm.get('price').value}' 
        WHERE barcode = '${myForm.get('barcode').value}'`, [])
        .then(() => {
          window.location.reload();
          console.log('Cart Item was updated!');
        })
      })
    }
    
   }

  /**
   * Delete cart item.
   * 
   */
  async deleteCartItem(id) {
    console.log('deleting item ID...', id);
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 500
    });
    loading.present();
    this.openPosDB().then((db:SQLiteObject) => {
      this.db_obj = db;
      this.db_obj.executeSql(`DELETE FROM cartItems WHERE id=${id}`, [])
      .then(() => {
        console.log('An item was deleted.');
        window.location.reload();
      })
    })
  }

  /**
   * Delete item.
   * 
   */
   async deleteItem(id) {
    console.log('deleting item ID...', id);
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 500
    });
    loading.present();
    this.openPosDB().then((db:SQLiteObject) => {
      this.db_obj = db;
      this.db_obj.executeSql(`DELETE FROM itemlist WHERE id=${id}`, [])
      .then(() => {
        console.log('An item was deleted.');
        window.location.reload();
      })
    })
  }


  /**
   * Clear all cart items.
   * 
   */
  clearAllCarts() {
    this.openPosDB().then((db:SQLiteObject) => {
      this.db_obj = db;
        this.db_obj.executeSql('DELETE FROM cartItems', [])
      .then(() => {
        window.location.reload();
        console.log('All cart items were cleared!');
      })
      .catch(err => {
        console.log(err);
      })
    })
  }
}
