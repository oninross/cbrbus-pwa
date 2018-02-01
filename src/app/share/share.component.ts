import { Component, OnInit } from '@angular/core';
import { BtnComponent } from '../btn/btn.component';

@Component({
    selector: 'app-share',
    templateUrl: './share.component.html',
    styleUrls: [
        './share.component.scss',
        '../btn/btn.component.scss'
    ]
})
export class ShareComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}
