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
    });
  }

  /**
   * Select users from users table.
   * 
   */
  select() {
    return new Promise((resolve,reject) => {
      this.open().then((dbObj) => {
        dbObj.executeSql('SELECT uid,email,password FROM users', [])
        .then((data) => {
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
}
