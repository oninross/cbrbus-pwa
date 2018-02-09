import { Component, OnInit } from '@angular/core';
import { Helpers } from '../__shared/helpers';

@Component({
    selector: 'app-busstop',
    templateUrl: './busstop.component.html',
    styleUrls: ['./busstop.component.scss']
})
export class BusstopComponent implements OnInit {

    busStopId: string;

    constructor(
        private helpers: Helpers
    ) { }

    ngOnInit() {
        if (this.helpers.getQueryVariable('busStopId')) {
            this.busStopId = this.helpers.getQueryVariable('busStopId');
        }
    }

}
