import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-card-bus',
    templateUrl: './card-bus.component.html',
    styleUrls: [
        './card-bus.component.scss',
        '../card/card.component.scss'
    ]
})
export class CardBusComponent implements OnInit {

    @Input() buses: Array<any>;

    constructor(
        private router: Router
    ) { }

    ngOnInit() {
    }

    showBusPath(event:any) {
        this.router.navigate(['/trackmybus/'], {
            queryParams: {
                busStopId: event.busStopId,
                busId: event.serviceNum,
                vehicleRef: event.vehicleRefNum[0][0]
            }
        });
    }
}
