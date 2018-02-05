import { Component, OnInit } from '@angular/core';
import { Injector } from '@angular/core/src/di/injector';

@Component({
    selector: 'app-toaster',
    templateUrl: './toaster.component.html',
    styleUrls: ['./toaster.component.scss']
})
export class ToasterComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

    toast(string) {
        console.log(string);
    }

}
