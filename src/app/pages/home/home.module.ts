import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    HomePageRoutingModule
  ],
  providers: [BarcodeScanner],
  declarations: [HomePage]
})
export class HomePageModule {}
