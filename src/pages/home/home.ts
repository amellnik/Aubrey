import { Component } from '@angular/core';
// import { HttpErrorResponse } from '@angular/common/http';
import { NavController, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';

import { ApiProvider } from './../../providers/api/api';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public navCtrl: NavController,
    private geolocation: Geolocation,
    private qrScanner: QRScanner,
    public alertCtrl: AlertController,
    public apiProvider: ApiProvider
  ) {
    console.log("Home constructor")

  }

  lat: number;
  long: number;
  qrText: string;

  go() {
    this.geolocation.getCurrentPosition().then((resp) => {
     console.log(resp.coords.latitude + ',' + resp.coords.longitude);
     this.lat = resp.coords.latitude;
     this.long = resp.coords.longitude;
     this.doScan();
    }).catch((error) => {
      console.log('Error getting location', error.message);
      this.showAlert('Error getting location', error.message);
    });
  }


  doScan() {
    this.qrScanner.prepare().then((status: QRScannerStatus) => {
     if (status.authorized) {
       let scanSub = this.qrScanner.scan().subscribe((text: string) => {
         console.log('Scanned something', text);
         this.qrText = text;
         this.qrScanner.hide(); // hide camera preview
         window.document.querySelector('ion-app').classList.remove('transparent-body');
         scanSub.unsubscribe(); // stop scanning

         this.apiProvider.sendUpdate(this.lat, this.long, this.qrText).subscribe(res => {
           this.showAlert('Update sent', text);
         }, err => {
           this.showAlert('POST error', err.error);
         })
       });

       this.qrScanner.show();
       window.document.querySelector('ion-app').classList.add('transparent-body');

     } else if (status.denied) {
       console.log("I need the camera to scan...");
       this.showAlert('I need the camera to scan', "Status denied");
     } else {
       console.log("I need the camera to scan...");
       this.showAlert('I need the camera to scan', "Other error");
     }
  })
  .catch((e: any) => {
    console.log('Error is', e);
    this.showAlert('QR code error', e);
    });
  }

  showAlert(title:string, message:string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

testAPI() {
  this.apiProvider.test().subscribe(res => {
    this.showAlert('It worked', JSON.stringify(res));
  }, err => {
    this.showAlert('It did not work', JSON.stringify(err));
  })
}

sendFakeUpdate() {
  this.apiProvider.sendFakeUpdate().subscribe(res => {
    this.showAlert('It worked', JSON.stringify(res));
  }, err => {
    this.showAlert('It did not work', JSON.stringify(err));
  })
}


}
