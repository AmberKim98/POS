import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/database/database.service';
import { TotalPage } from '../total/total.page';

@Component({
  selector: 'app-recent',
  templateUrl: './recent.page.html',
  styleUrls: ['./recent.page.scss'],
})
export class RecentPage implements OnInit {
  data:any = [];
  items:any = [];
  public today;

  constructor(
    private dbService: DatabaseService,
    private totalPage: TotalPage
  ) {
    this.today = totalPage.today;
   }

  ngOnInit() {
    this.dbService.getCartItems().then(res => {
      this.data = res;
      for(var i=0; i<this.data.rows.length; i++) {
        this.items.push(this.data.rows.item(i));
      }
      console.log(this.items);
    })
  }

}
