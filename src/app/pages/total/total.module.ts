import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TotalPageRoutingModule } from './total-routing.module';

import { TotalPage } from './total.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TotalPageRoutingModule
  ],
  declarations: [TotalPage]
})
export class TotalPageModule {}
