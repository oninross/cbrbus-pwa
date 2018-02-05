import { Component, OnInit } from '@angular/core';
import { BtnComponent } from '../btn/btn.component';
import { slideInOutAnimation } from '../__shared/animations';

@Component({
    selector: 'app-share',
    templateUrl: './share.component.html',
    styleUrls: [
        './share.component.scss',
        '../btn/btn.component.scss'
    ],
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' }
})
export class ShareComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}
