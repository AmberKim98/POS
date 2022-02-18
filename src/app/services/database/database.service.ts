import { Injectable, OnInit } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService implements OnInit{

  public db_obj: SQLiteObject;
  data:any = [];

  constructor(
    private sqlite: SQLite,
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
    })
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
        this.createUserTable();
        dbObj.executeSql('SELECT uid,email,password FROM users', [])
        .then((data) => {
          if(data.rows.length < 1) {
            dbObj.executeSql(`INSERT INTO users(uid, name, email, password, gender, address) VALUES (1, 'tester', 'tester@gmail.com', '123456', 'male', 'ygn')`, []);
          }
          console.log(data.rows.length);
          for(var i=0; i<data.rows.length; i++)
          {
            this.data.push(data.rows.item(i));
          }
          console.log(this.data);
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
    this.open().then((db: SQLiteObject) => {
      this.db_obj = db;
      this.db_obj.executeSql('CREATE TABLE IF NOT EXISTS users(uid INTEGER PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), password VARCHAR(255), gender VARCHAR(255), address VARCHAR(255))', [])
      .then(() => {
        console.log('User table was created.');
      })
    })
    
  }

  getItems() {
    return new Promise((resolve, reject) => {
      this.openPosDB().then((dbObj) => {
        dbObj.executeSql('SELECT * FROM itemlist', [])
        .then(data => {
          for(var i=0; i<data.rows.length; i++)
          {
            this.data.push(data.rows.item(i));
          }
          console.log(this.data);
          resolve(this.data);
        })
      })
    })
  }
}
