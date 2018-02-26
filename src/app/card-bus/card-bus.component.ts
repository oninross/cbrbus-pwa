import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-card-bus',
    templateUrl: './card-bus.component.html',
    styleUrls: [
        './card-bus.component.scss',
        '../card/card.component.scss'
    ]
})
export class CardBusComponent implements OnInit {

    @Input() buses:Array<any>;

    constructor() { }

    ngOnInit() {
    }

}
